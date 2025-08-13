import express, { Router, Request, Response } from 'express';
import { undefinedValuesDetected } from '../util/validation/requestValidation';
import { isValidDisplayName, isValidEmail, isValidNewPassword, isValidUsername } from '../util/validation/userValidation';
import { getRequestCookie } from '../util/cookieUtils';
import { dbPool } from '../db/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { generatePlaceHolders } from '../util/sqlUtils/generatePlaceHolders';
import { generateCryptoUuid } from '../util/tokenGenerator';
import { ACCOUNT_VERIFICATION_WINDOW } from '../util/constants';
import { sendAccountVerificationEmail } from '../util/email/emailServices';
import { isSqlError } from '../util/sqlUtils/isSqlError';
import { logUnexpectedError } from '../logs/errorLogger';

export const accountsRouter: Router = express.Router();

accountsRouter.post('/signUp', async (req: Request, res: Response) => {
  interface RequestData {
    email: string;
    username: string;
    password: string;
    displayName: string;
  }

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['email', 'username', 'password', 'displayName'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  if (!isValidEmail(requestData.email)) {
    res.status(400).json({ message: 'Invalid email.', reason: 'invalidEmail' });
    return;
  }

  if (!isValidUsername(requestData.username)) {
    res.status(400).json({ message: 'Invalid username.', reason: 'invalidUsername' });
    return;
  }

  if (!isValidNewPassword(requestData.password)) {
    res.status(400).json({ message: 'Invalid password.', reason: 'invalidPassword' });
    return;
  }

  if (!isValidDisplayName(requestData.displayName)) {
    res.status(400).json({ message: 'Invalid display name', reason: 'invalidDisplayName' });
    return;
  }

  if (requestData.username === requestData.password) {
    res.status(409).json({ message: 'Username and password must not be identical.', reason: 'passwordMatchesUsername' });
    return;
  }

  const isSignedIn: boolean = getRequestCookie(req, 'authSessionId') !== null;
  if (isSignedIn) {
    res.status(403).json({ message: 'You must sign out before being able to create a new account.', reason: 'signedIn' });
    return;
  }

  let connection;

  try {
    connection = await dbPool.getConnection();
    await connection.execute(`SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;`);
    await connection.beginTransaction();

    interface TakenStatus extends RowDataPacket {
      email_taken: boolean;
      username_taken: boolean;
    }

    const [takenStatusRows] = await connection.execute<TakenStatus[]>(
      `SELECT
        EXISTS (SELECT 1 FROM accounts WHERE email = ?) AS email_taken,
        EXISTS (SELECT 1 FROM accounts WHERE username = ?) AS username_taken;`,
      [requestData.email, requestData.email]
    );

    const takenStatus: TakenStatus | undefined = takenStatusRows[0];

    if (!takenStatus) {
      res.status(500).json({ message: 'Internal server error.' });
      await connection.rollback();

      return;
    }

    if (takenStatus.email_taken) {
      res.status(409).json({ message: 'Email is taken.', reason: 'emailTaken' });
      await connection.rollback();

      return;
    }

    if (takenStatus.username_taken) {
      res.status(409).json({ message: 'Username is taken.', reason: 'usernameTaken' });
      await connection.rollback();

      return;
    }

    const currentTimestamp: number = Date.now();

    const hashedPassword: string = await bcrypt.hash(requestData.password, 10);
    const publicAccountId: string = generateCryptoUuid();

    const [resultSetHeader] = await connection.execute<ResultSetHeader>(
      `INSERT INTO accounts (
        public_account_id,
        email,
        hashed_password,
        username,
        display_name,
        created_on_timestamp,
        is_verified,
        failed_sign_in_attempts
      ) VALUES (${generatePlaceHolders(8)});`,
      [publicAccountId, requestData.email, hashedPassword, requestData.username, requestData.displayName, currentTimestamp, false, 0]
    );

    const accountId: number = resultSetHeader.insertId;

    const verificationToken: string = generateCryptoUuid();
    const verificationExpiryTimestamp: number = currentTimestamp + ACCOUNT_VERIFICATION_WINDOW;

    await connection.execute(
      `INSERT INTO account_preferences (
        account_id,
        is_private,
        approve_follow_requests
      ) VALUES (${generatePlaceHolders(3)});`,
      [accountId, true, true]
    );

    await connection.execute(
      `INSERT INTO account_verification (
        account_id,
        verification_token,
        verification_emails_sent,
        failed_verification_attempts,
        expiry_timestamp
      ) VALUES (${generatePlaceHolders(5)});`,
      [accountId, verificationToken, 1, 0, verificationExpiryTimestamp]
    );

    await connection.commit();
    res.json({ publicAccountId });

    await sendAccountVerificationEmail({
      receiver: requestData.email,
      displayName: requestData.displayName,
      accountId,
      verificationToken,
    });
  } catch (err: unknown) {
    console.log(err);
    await connection?.rollback();

    if (res.headersSent) {
      return;
    }

    if (!isSqlError(err)) {
      res.status(500).json({ message: 'Internal server error.' });
      await logUnexpectedError(req, err);

      return;
    }

    const sqlError: SqlError = err;

    if (sqlError.errno === 1062 && sqlError.sqlMessage?.endsWith(`for key 'email'`)) {
      res.status(409).json({ message: 'Email is taken.', reason: 'emailTaken' });
      return;
    }

    if (sqlError.errno === 1062 && sqlError.sqlMessage?.endsWith(`for key 'username'`)) {
      res.status(409).json({ message: 'Username is taken.', reason: 'usernameTaken' });
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  } finally {
    connection?.release();
  }
});
