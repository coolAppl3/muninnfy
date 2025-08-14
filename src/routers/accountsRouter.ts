import express, { Router, Request, Response } from 'express';
import { undefinedValuesDetected } from '../util/validation/requestValidation';
import { isValidDisplayName, isValidEmail, isValidNewPassword, isValidUsername } from '../util/validation/userValidation';
import { getRequestCookie } from '../util/cookieUtils';
import { dbPool } from '../db/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { generatePlaceHolders } from '../util/sqlUtils/generatePlaceHolders';
import { generateCryptoUuid, isValidUuid } from '../util/tokenGenerator';
import { ACCOUNT_EMAILS_SENT_LIMIT, ACCOUNT_FAILED_UPDATE_LIMIT, ACCOUNT_VERIFICATION_WINDOW } from '../util/constants';
import { sendAccountVerificationEmail } from '../util/email/emailServices';
import { isSqlError } from '../util/sqlUtils/isSqlError';
import { logUnexpectedError } from '../logs/errorLogger';
import { deleteAccountById } from '../db/helpers/accountDbHelpers';

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
    res.status(201).json({ publicAccountId });

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

accountsRouter.patch('/verification/resendEmail', async (req: Request, res: Response) => {
  interface RequestData {
    publicAccountId: string;
  }

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['publicAccountId'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  if (!isValidUuid(requestData.publicAccountId)) {
    res.status(400).json({ message: 'Invalid account ID.', reason: 'invalidAccountId' });
    return;
  }

  try {
    interface AccountDetails extends RowDataPacket {
      account_id: number;
      email: string;
      display_name: string;
      is_verified: boolean;
      verification_id: number;
      verification_token: string;
      verification_emails_sent: number;
      failed_verification_attempts: number;
    }

    const [accountRows] = await dbPool.execute<AccountDetails[]>(
      `SELECT
        accounts.account_id,
        accounts.email,
        accounts.display_name,
        accounts.is_verified,
        account_verification.verification_id,
        account_verification.verification_token,
        account_verification.verification_emails_sent,
        account_verification.failed_verification_attempts
      FROM
        accounts
      LEFT JOIN
        account_verification ON accounts.account_id = account_verification.account_id
      WHERE
        accounts.public_account_id = ?;`,
      [requestData.publicAccountId]
    );

    const accountDetails: AccountDetails | undefined = accountRows[0];

    if (!accountDetails) {
      res.status(404).json({ message: 'Account not found.', reason: 'accountNotFound' });
      return;
    }

    if (accountDetails.is_verified) {
      res.status(409).json({ message: 'Account is already verified.', reason: 'alreadyVerified' });
      return;
    }

    if (!accountDetails.verification_id) {
      const accountDeleted: boolean = await deleteAccountById(accountDetails.account_id, dbPool);

      if (!accountDeleted) {
        res.status(500).json({ message: 'Internal server error.' });
        return;
      }

      res.status(404).json({ message: 'Account not found.', reason: 'accountNotFound' });
      return;
    }

    if (accountDetails.failed_verification_attempts >= ACCOUNT_FAILED_UPDATE_LIMIT) {
      const accountDeleted: boolean = await deleteAccountById(accountDetails.account_id, dbPool);

      if (!accountDeleted) {
        res.status(500).json({ message: 'Internal server error.' });
        return;
      }

      res.status(403).json({ message: 'Too many failed verification attempts.', reason: 'failureLimitReached' });
      return;
    }

    if (accountDetails.verification_emails_sent >= ACCOUNT_EMAILS_SENT_LIMIT) {
      res.status(403).json({ message: `Sent verification emails limit reached.`, reason: 'emailLimitReached' });
      return;
    }

    const [resultSetHeader] = await dbPool.execute<ResultSetHeader>(
      `UPDATE
        account_verification
      SET
        verification_emails_sent = verification_emails_sent + 1
      WHERE
        verification_id = ?;`,
      [accountDetails.verification_id]
    );

    if (resultSetHeader.affectedRows === 0) {
      await logUnexpectedError(req, null, 'Failed to increment verification_emails_sent.');
    }

    res.json({});

    await sendAccountVerificationEmail({
      accountId: accountDetails.account_id,
      receiver: accountDetails.email,
      displayName: accountDetails.display_name,
      verificationToken: accountDetails.verification_token,
    });
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
  }
});
