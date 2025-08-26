import express, { Router, Request, Response } from 'express';
import { undefinedValuesDetected } from '../util/validation/requestValidation';
import { isValidDisplayName, isValidEmail, isValidNewPassword, isValidPassword, isValidUsername } from '../util/validation/userValidation';
import { getRequestCookie } from '../util/cookieUtils';
import { dbPool } from '../db/db';
import { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { generatePlaceHolders } from '../util/sqlUtils/generatePlaceHolders';
import { generateCryptoUuid, isValidUuid } from '../util/tokenGenerator';
import {
  ACCOUNT_EMAILS_SENT_LIMIT,
  ACCOUNT_FAILED_SIGN_IN_LIMIT,
  ACCOUNT_FAILED_UPDATE_LIMIT,
  ACCOUNT_VERIFICATION_WINDOW,
} from '../util/constants';
import { sendAccountVerificationEmail } from '../util/email/emailServices';
import { isSqlError } from '../util/sqlUtils/isSqlError';
import { logUnexpectedError } from '../logs/errorLogger';
import {
  deleteAccountById,
  incrementFailedVerificationAttempts,
  incrementVerificationEmailsSent,
  resetFailedSignInAttempts,
} from '../db/helpers/accountDbHelpers';
import { createAuthSession } from '../auth/authSessions';

export const accountsRouter: Router = express.Router();

accountsRouter.post('/signUp', async (req: Request, res: Response) => {
  const isSignedIn: boolean = getRequestCookie(req, 'authSessionId') !== null;
  if (isSignedIn) {
    res.status(403).json({ message: 'You must must sign out before proceeding.', reason: 'signedIn' });
    return;
  }

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
    res.status(409).json({ message: `Username and password can't match.`, reason: 'passwordMatchesUsername' });
    return;
  }

  let connection: PoolConnection | null = null;

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
      publicAccountId,
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

accountsRouter.post('/verification/continue', async (req: Request, res: Response) => {
  const isSignedIn: boolean = getRequestCookie(req, 'authSessionId') !== null;
  if (isSignedIn) {
    res.status(403).json({ message: 'You must must sign out before proceeding.', reason: 'signedIn' });
    return;
  }

  interface RequestData {
    email: string;
  }

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['email'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  if (!isValidEmail(requestData.email)) {
    res.status(400).json({ message: 'Invalid email.', reason: 'invalidEmail' });
    return;
  }

  try {
    interface AccountDetails extends RowDataPacket {
      account_id: number;
      public_account_id: string;
      is_verified: boolean;
      verification_request_exists: boolean;
    }

    const [accountRows] = await dbPool.execute<AccountDetails[]>(
      `SELECT
        accounts.account_id,
        accounts.public_account_id,
        accounts.is_verified,
        (SELECT 1 FROM account_verification WHERE account_id = accounts.account_id) AS verification_request_exists
      FROM
        accounts
      WHERE
        email = ?;`,
      [requestData.email]
    );

    const accountDetails: AccountDetails | undefined = accountRows[0];

    if (!accountDetails) {
      res.status(404).json({ message: 'Verification request not found.', reason: 'requestNotFound' });
      return;
    }

    if (accountDetails.is_verified) {
      res.status(404).json({ message: 'Verification request not found.', reason: 'requestNotFound' });
      return;
    }

    if (!accountDetails.verification_request_exists) {
      await deleteAccountById(accountDetails.account_id, dbPool, req);
      res.status(404).json({ message: 'Verification request not found.', reason: 'requestNotFound' });
      return;
    }

    res.json({ publicAccountId: accountDetails.public_account_id });
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
  }
});

accountsRouter.patch('/verification/resendEmail', async (req: Request, res: Response) => {
  const isSignedIn: boolean = getRequestCookie(req, 'authSessionId') !== null;
  if (isSignedIn) {
    res.status(403).json({ message: 'You must must sign out before proceeding.', reason: 'signedIn' });
    return;
  }

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
      public_account_id: string;
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
        accounts.public_account_id,
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

    if (!accountDetails.verification_id || accountDetails.failed_verification_attempts >= ACCOUNT_FAILED_UPDATE_LIMIT) {
      await deleteAccountById(accountDetails.account_id, dbPool, req);
      res.status(404).json({ message: 'Account not found.', reason: 'accountNotFound' });

      return;
    }

    if (accountDetails.verification_emails_sent >= ACCOUNT_EMAILS_SENT_LIMIT) {
      res.status(403).json({ message: `Sent verification emails limit reached.`, reason: 'emailLimitReached' });
      return;
    }

    await incrementVerificationEmailsSent(accountDetails.verification_id, dbPool, req);
    res.json({});

    await sendAccountVerificationEmail({
      receiver: accountDetails.email,
      displayName: accountDetails.display_name,
      publicAccountId: accountDetails.public_account_id,
      verificationToken: accountDetails.verification_token,
    });
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  }
});

accountsRouter.patch('/verification/verify', async (req: Request, res: Response) => {
  const isSignedIn: boolean = getRequestCookie(req, 'authSessionId') !== null;
  if (isSignedIn) {
    res.status(403).json({ message: 'You must must sign out before proceeding.', reason: 'signedIn' });
    return;
  }

  interface RequestData {
    publicAccountId: string;
    verificationToken: string;
  }

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['publicAccountId', 'verificationToken'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  if (!isValidUuid(requestData.publicAccountId)) {
    res.status(400).json({ message: 'Invalid account ID.', reason: 'invalidAccountId' });
    return;
  }

  if (!isValidUuid(requestData.verificationToken)) {
    res.status(400).json({ message: 'Invalid verification token.', reason: 'invalidVerificationToken' });
    return;
  }

  let connection: PoolConnection | null = null;

  try {
    connection = await dbPool.getConnection();
    await connection.execute(`SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;`);
    await connection.beginTransaction();

    interface AccountDetails extends RowDataPacket {
      account_id: number;
      is_verified: boolean;
      verification_id: number;
      verification_token: string;
      failed_verification_attempts: number;
    }

    const [accountRows] = await connection.execute<AccountDetails[]>(
      `SELECT
        accounts.account_id,
        accounts.is_verified,
        account_verification.verification_id,
        account_verification.verification_token,
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
      await connection.rollback();
      res.status(404).json({ message: 'Account not found.', reason: 'accountNotfound' });

      return;
    }

    if (accountDetails.is_verified) {
      await connection.rollback();
      res.status(409).json({ message: 'Account is already verified.', reason: 'alreadyVerified' });

      return;
    }

    if (!accountDetails.verification_id || accountDetails.failed_verification_attempts >= ACCOUNT_FAILED_UPDATE_LIMIT) {
      await deleteAccountById(accountDetails.account_id, dbPool, req);
      res.status(404).json({ message: 'Account not found.', reason: 'accountNotfound' });

      return;
    }

    if (requestData.verificationToken === accountDetails.verification_token) {
      const [resultSetHeader] = await connection.execute<ResultSetHeader>(
        `UPDATE
          accounts
        SET
          is_verified = ?
        WHERE
          account_id = ?;`,
        [true, accountDetails.account_id]
      );

      if (resultSetHeader.affectedRows === 0) {
        await connection.rollback();
        res.status(500).json({ message: 'Internal server error.' });

        return;
      }

      await connection.commit();
      res.json({});

      return;
    }

    await connection.rollback();

    if (accountDetails.failed_verification_attempts + 1 >= ACCOUNT_FAILED_UPDATE_LIMIT) {
      await deleteAccountById(accountDetails.account_id, dbPool, req);
      res.status(401).json({ message: 'Incorrect verification token.', reason: 'incorrectVerificationToken_deleted' });

      return;
    }

    await incrementFailedVerificationAttempts(accountDetails.verification_id, dbPool, req);
    res.status(401).json({ message: 'Incorrect verification token.', reason: 'incorrectVerificationToken' });
  } catch (err: unknown) {
    console.log(err);
    connection?.rollback();

    if (res.headersSent) {
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  } finally {
    connection?.release();
  }
});

accountsRouter.post('/signIn', async (req: Request, res: Response) => {
  const isSignedIn: boolean = getRequestCookie(req, 'authSessionId') !== null;
  if (isSignedIn) {
    res.status(403).json({ message: `You're already signed in.`, reason: 'alreadySignedIn' });
    return;
  }

  interface RequestData {
    email: string;
    password: string;
    keepSignedIn: boolean;
  }

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['email', 'password', 'keepSignedIn'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  if (!isValidEmail(requestData.email)) {
    res.status(400).json({ message: 'Invalid email.', reason: 'invalidEmail' });
    return;
  }

  if (!isValidPassword(requestData.password)) {
    res.status(400).json({ message: 'Invalid password.', reason: 'invalidPassword' });
    return;
  }

  if (typeof requestData.keepSignedIn !== 'boolean') {
    requestData.keepSignedIn = false;
  }

  try {
    interface AccountDetails extends RowDataPacket {
      account_id: number;
      hashed_password: string;
      is_verified: boolean;
      failed_sign_in_attempts: number;
    }

    const [accountRows] = await dbPool.execute<AccountDetails[]>(
      `SELECT
        account_id,
        hashed_password,
        is_verified,
        failed_sign_in_attempts
      FROM
        accounts
      WHERE
        email = ?;`,
      [requestData.email]
    );

    const accountDetails: AccountDetails | undefined = accountRows[0];

    if (!accountDetails) {
      res.status(404).json({ message: 'Account not found or unverified.', reason: 'accountNotFound' });
      return;
    }

    if (!accountDetails.is_verified) {
      res.status(404).json({ message: 'Account not found or unverified.', reason: 'accountNotFound' });
      return;
    }

    const isLocked: boolean = accountDetails.failed_sign_in_attempts >= ACCOUNT_FAILED_SIGN_IN_LIMIT;
    if (isLocked) {
      res.status(403).json({ message: 'Account is locked.', reason: 'accountLocked' });
      return;
    }

    const isCorrectPassword: boolean = await bcrypt.compare(requestData.password, accountDetails.hashed_password);
    if (!isCorrectPassword) {
      const incremented: boolean = await incrementFailedVerificationAttempts(accountDetails.account_id, dbPool, req);
      const hasBeenLocked: boolean = accountDetails.failed_sign_in_attempts + 1 >= ACCOUNT_FAILED_SIGN_IN_LIMIT && incremented;

      res.status(401).json({
        message: `Incorrect password.${hasBeenLocked ? ' Account locked.' : ''}`,
        reason: hasBeenLocked ? 'incorrectPassword_locked' : 'incorrectPassword',
      });

      return;
    }

    if (accountDetails.failed_sign_in_attempts > 0) {
      await resetFailedSignInAttempts(accountDetails.account_id, dbPool, req);
    }

    const authSessionCreated: boolean = await createAuthSession(res, accountDetails.account_id, requestData.keepSignedIn);
    if (!authSessionCreated) {
      res.status(500).json({ message: 'Internal server error.' });
      return;
    }

    res.json({});
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  }
});
