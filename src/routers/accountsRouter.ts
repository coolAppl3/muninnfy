import express, { Router, Request, Response } from 'express';
import { undefinedValuesDetected } from '../util/validation/requestValidation';
import { isValidDisplayName, isValidEmail, isValidNewPassword, isValidPassword, isValidUsername } from '../util/validation/userValidation';
import { getRequestCookie, removeRequestCookie } from '../util/cookieUtils';
import { dbPool } from '../db/db';
import { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { generatePlaceHolders } from '../util/sqlUtils/generatePlaceHolders';
import { generateCryptoUuid, generateConfirmationCode, isValidUuid, isValidConfirmationCode } from '../util/tokenGenerator';
import {
  ACCOUNT_EMAIL_UPDATE_WINDOW,
  ACCOUNT_EMAILS_SENT_LIMIT,
  ACCOUNT_FAILED_SIGN_IN_LIMIT,
  ACCOUNT_FAILED_UPDATE_LIMIT,
  ACCOUNT_VERIFICATION_WINDOW,
} from '../util/constants/accountConstants';
import { sendAccountVerificationEmailService, sendEmailUpdateStartEmailService } from '../util/email/emailServices';
import { isSqlError } from '../util/sqlUtils/isSqlError';
import { logUnexpectedError } from '../logs/errorLogger';
import {
  deleteAccountById,
  handleIncorrectPassword,
  incrementedFailedEmailUpdateAttempts,
  incrementEmailUpdateEmailsSent,
  incrementFailedVerificationAttempts,
  incrementVerificationEmailsSent,
  resetFailedSignInAttempts,
  suspendEmailUpdateRequest,
} from '../db/helpers/accountDbHelpers';
import { createAuthSession, purgeAuthSessions } from '../auth/authSessions';
import { getAuthSessionId } from '../auth/authUtils';
import { getAccountIdByAuthSessionId } from '../db/helpers/authDbHelpers';

export const accountsRouter: Router = express.Router();

accountsRouter.post('/signUp', async (req: Request, res: Response) => {
  const isSignedIn: boolean = getRequestCookie(req, 'authSessionId') !== null;
  if (isSignedIn) {
    res.status(403).json({ message: 'You must must sign out before proceeding.', reason: 'signedIn' });
    return;
  }

  type RequestData = {
    email: string;
    username: string;
    password: string;
    displayName: string;
  };

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['email', 'username', 'password', 'displayName'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  const { email, username, password, displayName } = requestData;

  if (!isValidEmail(email)) {
    res.status(400).json({ message: 'Invalid email.', reason: 'invalidEmail' });
    return;
  }

  if (!isValidUsername(username)) {
    res.status(400).json({ message: 'Invalid username.', reason: 'invalidUsername' });
    return;
  }

  if (!isValidNewPassword(password)) {
    res.status(400).json({ message: 'Invalid password.', reason: 'invalidPassword' });
    return;
  }

  if (!isValidDisplayName(displayName)) {
    res.status(400).json({ message: 'Invalid display name', reason: 'invalidDisplayName' });
    return;
  }

  if (username === password) {
    res.status(409).json({ message: `Username and password can't match.`, reason: 'passwordMatchesUsername' });
    return;
  }

  let connection: PoolConnection | null = null;

  try {
    connection = await dbPool.getConnection();
    await connection.execute(`SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;`);
    await connection.beginTransaction();

    type TakenStatus = {
      email_taken: boolean;
      email_temporarily_taken: boolean;
      username_taken: boolean;
    };

    const [takenStatusRows] = await connection.execute<RowDataPacket[]>(
      `SELECT
        EXISTS (SELECT 1 FROM accounts WHERE email = ? FOR UPDATE) AS email_taken,
        EXISTS (SELECT 1 FROM email_update WHERE new_email = ? FOR UPDATE) AS email_temporarily_taken,
        EXISTS (SELECT 1 FROM accounts WHERE username = ? FOR UPDATE) AS username_taken;`,
      [email, email, username]
    );

    const takenStatus = takenStatusRows[0] as TakenStatus | undefined;

    if (!takenStatus) {
      await connection.rollback();
      res.status(500).json({ message: 'Internal server error.' });

      await logUnexpectedError(req, null, 'Failed to fetch taken status.');
      return;
    }

    if (takenStatus.email_taken || takenStatus.email_temporarily_taken) {
      await connection.rollback();
      res.status(409).json({ message: 'Email is taken.', reason: 'emailTaken' });

      return;
    }

    if (takenStatus.username_taken) {
      await connection.rollback();
      res.status(409).json({ message: 'Username is taken.', reason: 'usernameTaken' });

      return;
    }

    const currentTimestamp: number = Date.now();

    const hashedPassword: string = await bcrypt.hash(password, 10);
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
      [publicAccountId, email, hashedPassword, username, displayName, currentTimestamp, false, 0]
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

    await sendAccountVerificationEmailService({
      receiver: email,
      displayName: displayName,
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

    if (err.errno === 1062 && err.sqlMessage?.endsWith(`for key 'email'`)) {
      res.status(409).json({ message: 'Email is taken.', reason: 'emailTaken' });
      return;
    }

    if (err.errno === 1062 && err.sqlMessage?.endsWith(`for key 'username'`)) {
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

  type RequestData = {
    email: string;
  };

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['email'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  const { email } = requestData;

  if (!isValidEmail(email)) {
    res.status(400).json({ message: 'Invalid email.', reason: 'invalidEmail' });
    return;
  }

  try {
    type AccountDetails = {
      account_id: number;
      public_account_id: string;
      is_verified: boolean;
      verification_request_exists: boolean;
    };

    const [accountRows] = await dbPool.execute<RowDataPacket[]>(
      `SELECT
        accounts.account_id,
        accounts.public_account_id,
        accounts.is_verified,

        (SELECT 1 FROM account_verification WHERE account_id = accounts.account_id) AS verification_request_exists
      FROM
        accounts
      WHERE
        email = ?;`,
      [email]
    );

    const accountDetails = accountRows[0] as AccountDetails | undefined;

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
    await logUnexpectedError(req, err);
  }
});

accountsRouter.patch('/verification/resendEmail', async (req: Request, res: Response) => {
  const isSignedIn: boolean = getRequestCookie(req, 'authSessionId') !== null;
  if (isSignedIn) {
    res.status(403).json({ message: 'You must must sign out before proceeding.', reason: 'signedIn' });
    return;
  }

  type RequestData = {
    publicAccountId: string;
  };

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['publicAccountId'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  const { publicAccountId } = requestData;

  if (!isValidUuid(publicAccountId)) {
    res.status(400).json({ message: 'Invalid account ID.', reason: 'invalidAccountId' });
    return;
  }

  try {
    type AccountDetails = {
      account_id: number;
      public_account_id: string;
      email: string;
      display_name: string;
      is_verified: boolean;
      verification_id: number;
      verification_token: string;
      verification_emails_sent: number;
      failed_verification_attempts: number;
    };

    const [accountRows] = await dbPool.execute<RowDataPacket[]>(
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
        account_verification USING(account_id)
      WHERE
        accounts.public_account_id = ?;`,
      [publicAccountId]
    );

    const accountDetails = accountRows[0] as AccountDetails | undefined;

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
      res.status(403).json({ message: `Sent verification emails limit reached.`, reason: 'emailsSentLimitReached' });
      return;
    }

    await incrementVerificationEmailsSent(accountDetails.verification_id, dbPool, req);
    res.json({});

    await sendAccountVerificationEmailService({
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

  type RequestData = {
    publicAccountId: string;
    verificationToken: string;
  };

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['publicAccountId', 'verificationToken'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  const { publicAccountId, verificationToken } = requestData;

  if (!isValidUuid(publicAccountId)) {
    res.status(400).json({ message: 'Invalid account ID.', reason: 'invalidAccountId' });
    return;
  }

  if (!isValidUuid(verificationToken)) {
    res.status(400).json({ message: 'Invalid verification token.', reason: 'invalidVerificationToken' });
    return;
  }

  let connection: PoolConnection | null = null;

  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    type AccountDetails = {
      account_id: number;
      is_verified: boolean;
      verification_id: number;
      verification_token: string;
      failed_verification_attempts: number;
    };

    const [accountRows] = await connection.execute<RowDataPacket[]>(
      `SELECT
        accounts.account_id,
        accounts.is_verified,

        account_verification.verification_id,
        account_verification.verification_token,
        account_verification.failed_verification_attempts
      FROM
        accounts
      LEFT JOIN
        account_verification USING(account_id)
      WHERE
        accounts.public_account_id = ?
      FOR UPDATE;`,
      [publicAccountId]
    );

    const accountDetails = accountRows[0] as AccountDetails | undefined;

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
      await connection.rollback();

      await deleteAccountById(accountDetails.account_id, dbPool, req);
      res.status(404).json({ message: 'Account not found.', reason: 'accountNotfound' });

      return;
    }

    if (verificationToken === accountDetails.verification_token) {
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

        await logUnexpectedError(req, null, 'Failed to update is_verified.');
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
    res.status(403).json({ message: 'Already signed in.', reason: 'alreadySignedIn' });
    return;
  }

  type RequestData = {
    email: string;
    password: string;
    keepSignedIn: boolean;
  };

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['email', 'password', 'keepSignedIn'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  if (typeof requestData.keepSignedIn !== 'boolean') {
    requestData.keepSignedIn = false;
  }

  const { email, password, keepSignedIn } = requestData;

  if (!isValidEmail(email)) {
    res.status(400).json({ message: 'Invalid email.', reason: 'invalidEmail' });
    return;
  }

  if (!isValidPassword(password)) {
    res.status(400).json({ message: 'Invalid password.', reason: 'invalidPassword' });
    return;
  }

  try {
    type AccountDetails = {
      account_id: number;
      hashed_password: string;
      is_verified: boolean;
      failed_sign_in_attempts: number;
    };

    const [accountRows] = await dbPool.execute<RowDataPacket[]>(
      `SELECT
        account_id,
        hashed_password,
        is_verified,
        failed_sign_in_attempts
      FROM
        accounts
      WHERE
        email = ?;`,
      [email]
    );

    const accountDetails = accountRows[0] as AccountDetails | undefined;

    if (!accountDetails) {
      res.status(404).json({ message: 'Account not found or is unverified.', reason: 'accountNotFound' });
      return;
    }

    if (!accountDetails.is_verified) {
      res.status(404).json({ message: 'Account not found or is unverified.', reason: 'accountNotFound' });
      return;
    }

    const isLocked: boolean = accountDetails.failed_sign_in_attempts >= ACCOUNT_FAILED_SIGN_IN_LIMIT;
    if (isLocked) {
      res.status(403).json({ message: 'Account is locked.', reason: 'accountLocked' });
      return;
    }

    const passwordIsCorrect: boolean = await bcrypt.compare(password, accountDetails.hashed_password);
    if (!passwordIsCorrect) {
      await handleIncorrectPassword(accountDetails.account_id, accountDetails.failed_sign_in_attempts, dbPool, req, res);
      return;
    }

    if (accountDetails.failed_sign_in_attempts > 0) {
      await resetFailedSignInAttempts(accountDetails.account_id, dbPool, req);
    }

    const authSessionCreated: boolean = await createAuthSession(res, accountDetails.account_id, keepSignedIn);
    if (!authSessionCreated) {
      res.status(500).json({ message: 'Internal server error.' });
      await logUnexpectedError(req, null, 'Failed to create authSession.');

      return;
    }

    res.json({});

    await dbPool.execute(
      `DELETE FROM
        account_recovery
      WHERE
        account_id = ?;`,
      [accountDetails.account_id]
    );
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  }
});

accountsRouter.get('/', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, res);

  if (!accountId) {
    return;
  }

  try {
    type AccountDetails = {
      public_account_id: string;
      email: string;
      username: string;
      display_name: string;
      created_on_timestamp: number;
      is_private: boolean;
      approve_follow_requests: boolean;
    };

    const [accountRows] = await dbPool.execute<RowDataPacket[]>(
      `SELECT
        accounts.public_account_id,
        accounts.email,
        accounts.username,
        accounts.display_name,
        accounts.created_on_timestamp,

        account_preferences.is_private,
        account_preferences.approve_follow_requests
      FROM
        accounts
      LEFT JOIN
        account_preferences USING(account_id)
      WHERE
        accounts.account_id = ?;`,
      [accountId]
    );

    const accountDetails = accountRows[0] as AccountDetails | undefined;

    if (!accountDetails) {
      res.status(404).json({ message: 'Account not found.', reason: 'accountNotFound' });
      return;
    }

    res.json({ accountDetails });
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  }
});

accountsRouter.patch('/details/privacy', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  type RequestData = {
    isPrivate: boolean;
    approveFollowRequests: boolean;
  };

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['isPrivate', 'approveFollowRequests'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  const { isPrivate, approveFollowRequests } = requestData;

  if (typeof isPrivate !== 'boolean' || typeof approveFollowRequests !== 'boolean') {
    res.status(400).json({ message: 'Invalid privacy configuration.', reason: 'invalidConfiguration' });
    return;
  }

  if (isPrivate && !approveFollowRequests) {
    res.status(400).json({ message: 'Invalid privacy configuration.', reason: 'invalidConfiguration' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, res);

  if (!accountId) {
    return;
  }

  try {
    const [resultSetHeader] = await dbPool.execute<ResultSetHeader>(
      `UPDATE
        account_preferences
      SET
        is_private = ?,
        approve_follow_requests = ?
      WHERE
        account_id = ?;`,
      [isPrivate, approveFollowRequests, accountId]
    );

    if (resultSetHeader.affectedRows === 0) {
      res.status(500).json({ message: 'Internal server error.' });
      await logUnexpectedError(req, null, 'Failed to update is_private and approve_follow_requests.');

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

accountsRouter.patch('/details/displayName', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  type RequestData = {
    newDisplayName: string;
  };

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['newDisplayName'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  const { newDisplayName } = requestData;

  if (!isValidDisplayName(newDisplayName)) {
    res.status(400).json({ message: 'Invalid display name.', reason: 'invalidDisplayName' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, res);

  if (!accountId) {
    return;
  }

  try {
    type AccountDetails = {
      display_name: string;
    };

    const [accountRows] = await dbPool.execute<RowDataPacket[]>(
      `SELECT
        display_name
      FROM
        accounts
      WHERE
        account_id = ?;`,
      [accountId]
    );

    const accountDetails = accountRows[0] as AccountDetails | undefined;

    if (!accountDetails) {
      res.status(404).json({ message: 'Account not found.', reason: 'accountNotFound' });
      return;
    }

    if (accountDetails.display_name === newDisplayName) {
      res.status(409).json({ message: 'Account already has this display name.', reason: 'duplicateDisplayName' });
      return;
    }

    const [resultSetHeader] = await dbPool.execute<ResultSetHeader>(
      `UPDATE
        accounts
      SET
        display_name = ?
      WHERE
        account_id = ?;`,
      [newDisplayName, accountId]
    );

    if (resultSetHeader.affectedRows === 0) {
      res.status(500).json({ message: 'Internal server error.' });
      await logUnexpectedError(req, null, 'Failed to update display_name.');

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

accountsRouter.post('/details/email/start', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  type RequestData = {
    newEmail: string;
    password: string;
  };

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['newEmail', 'password'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  const { newEmail, password } = requestData;

  if (!isValidEmail(newEmail)) {
    res.status(400).json({ message: 'Invalid email address.', reason: 'invalidUsername' });
    return;
  }

  if (!isValidPassword(password)) {
    res.status(400).json({ message: 'Invalid password.', reason: 'invalidPassword' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, res);

  if (!accountId) {
    return;
  }

  let connection;

  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    type AccountDetails = {
      email: string;
      hashed_password: string;
      display_name: string;
      failed_sign_in_attempts: number;

      update_id: number;
      new_email: string;
      expiry_timestamp: number;
      failed_update_attempts: number;

      email_taken: boolean;
      email_temporarily_taken: boolean;
    };

    const [accountRows] = await connection.execute<ResultSetHeader[]>(
      `SELECT
        accounts.email,
        accounts.hashed_password,
        accounts.display_name,
        accounts.failed_sign_in_attempts,

        email_update.update_id,
        email_update.new_email,
        email_update.expiry_timestamp,
        email_update.failed_update_attempts,

        EXISTS (SELECT 1 FROM accounts WHERE email = :newEmail FOR UPDATE) AS email_taken,
        EXISTS (SELECT 1 FROM email_update WHERE new_email = :newEmail FOR UPDATE) AS email_temporarily_taken
      FROM
        accounts
      LEFT JOIN
        email_update USING(account_id)
      WHERE
        accounts.account_id = :accountId
      FOR UPDATE;`,
      { accountId, newEmail }
    );

    const accountDetails = accountRows[0] as AccountDetails | undefined;

    if (!accountDetails) {
      await connection.rollback();
      res.status(404).json({ message: 'Account not found.', reason: 'accountNotFound' });

      return;
    }

    if (accountDetails.failed_sign_in_attempts >= ACCOUNT_FAILED_SIGN_IN_LIMIT) {
      await connection.rollback();

      removeRequestCookie(res, 'authSessionId');
      await purgeAuthSessions(accountId);

      res.status(403).json({ message: 'Account is locked.', reason: 'accountLocked' });
      return;
    }

    const passwordIsCorrect: boolean = await bcrypt.compare(password, accountDetails.hashed_password);
    if (!passwordIsCorrect) {
      await connection.rollback();
      await handleIncorrectPassword(accountId, accountDetails.failed_sign_in_attempts, dbPool, req, res);

      return;
    }

    if (accountDetails.update_id) {
      await connection.rollback();

      res.status(409).json({
        message: 'Ongoing email change request found.',
        reason: 'ongoingRequest',
        resData: {
          emailUpdateId: accountDetails.update_id,
          newEmail: accountDetails.new_email,
          expiryTimestamp: accountDetails.expiry_timestamp,
          isSuspended: accountDetails.failed_update_attempts >= ACCOUNT_FAILED_UPDATE_LIMIT,
        },
      });

      return;
    }

    if (newEmail === accountDetails.email) {
      await connection.rollback();
      res.status(409).json({ message: 'Email already linked to this account.', reason: 'duplicateEmail' });

      return;
    }

    const confirmationCode: string = generateConfirmationCode();
    const expiryTimestamp: number = Date.now() + ACCOUNT_EMAIL_UPDATE_WINDOW;

    const [resultSetHeader] = await connection.execute<ResultSetHeader>(
      `INSERT INTO email_update (
        account_id,
        new_email,
        confirmation_code,
        expiry_timestamp,
        update_emails_sent,
        failed_update_attempts
      ) VALUES (${generatePlaceHolders(6)});`,
      [accountId, newEmail, confirmationCode, expiryTimestamp, 1, 0]
    );

    await connection.commit();
    res.json({ emailUpdateId: resultSetHeader.insertId, expiryTimestamp });

    await resetFailedSignInAttempts(accountId, dbPool, req);
    await sendEmailUpdateStartEmailService({
      receiver: newEmail,
      confirmationCode,
      displayName: accountDetails.display_name,
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

    if (err.errno === 1062 && err.sqlMessage?.endsWith(`for key 'new_email'`)) {
      res.status(409).json({ message: 'Email is taken.', reason: 'emailTaken' });
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  } finally {
    connection?.release();
  }
});

accountsRouter.patch('/details/email/resendEmail', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, res);

  if (!accountId) {
    return;
  }

  let connection;

  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    type AccountDetails = {
      display_name: string;
      failed_sign_in_attempts: number;
      update_id: number;
      new_email: string;
      confirmation_code: string;
      expiry_timestamp: number;
      update_emails_sent: number;
      failed_update_attempts: number;
    };

    const [accountRows] = await connection.execute<RowDataPacket[]>(
      `SELECT
        accounts.display_name,

        email_update.update_id,
        email_update.new_email,
        email_update.confirmation_code,
        email_update.expiry_timestamp,
        email_update.update_emails_sent,
        email_update.failed_update_attempts
      FROM
        accounts
      LEFT JOIN
        email_update USING(account_id)
      WHERE
        accounts.account_id = ?
      FOR UPDATE;`,
      [accountId]
    );

    const accountDetails = accountRows[0] as AccountDetails | undefined;

    if (!accountDetails) {
      await connection.rollback();
      res.status(404).json({ message: 'Account not found.', reason: 'accountNotFound' });

      return;
    }

    const isLocked: boolean = accountDetails.failed_sign_in_attempts >= ACCOUNT_FAILED_SIGN_IN_LIMIT;
    if (isLocked) {
      await connection.rollback();
      res.status(403).json({ message: 'Account is locked.', reason: 'accountLocked' });

      return;
    }

    if (!accountDetails.update_id) {
      await connection.rollback();
      res.status(404).json({ message: 'Email change request not found or has expired.', reason: 'requestNotFound' });

      return;
    }

    if (accountDetails.failed_update_attempts >= ACCOUNT_FAILED_UPDATE_LIMIT) {
      await connection.rollback();

      res.status(403).json({
        message: 'Email change request suspended.',
        reason: 'requestSuspended',
        resData: { expiryTimestamp: accountDetails.expiry_timestamp },
      });

      return;
    }

    if (accountDetails.update_emails_sent >= ACCOUNT_EMAILS_SENT_LIMIT) {
      await connection.rollback();
      res.status(403).json({ message: `Sent change emails limit reached.`, reason: 'emailsSentLimitReached' });

      return;
    }

    await incrementEmailUpdateEmailsSent(accountDetails.update_id, connection, req);

    await connection.commit();
    res.json({});

    const { new_email, display_name, confirmation_code } = accountDetails;
    await sendEmailUpdateStartEmailService({
      receiver: new_email,
      displayName: display_name,
      confirmationCode: confirmation_code,
    });
  } catch (err: unknown) {
    console.log(err);
    await connection?.rollback();

    if (res.headersSent) {
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  } finally {
    connection?.release();
  }
});

accountsRouter.patch('/details/email/confirm', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  type RequestData = {
    confirmationCode: string;
  };

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['confirmationCode'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  const { confirmationCode } = requestData;

  if (!isValidConfirmationCode(confirmationCode)) {
    res.status(400).json({ message: 'Invalid confirmation code.', reason: 'invalidCode' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, res);

  if (!accountId) {
    return;
  }

  let connection;

  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    type AccountDetails = {
      failed_sign_in_attempts: number;
      update_id: number;
      new_email: string;
      confirmation_code: string;
      expiry_timestamp: number;
      failed_update_attempts: number;
    };

    const [accountRows] = await connection.execute<RowDataPacket[]>(
      `SELECT
        accounts.failed_sign_in_attempts,
        email_update.update_id,
        email_update.new_email,
        email_update.confirmation_code,
        email_update.expiry_timestamp,
        email_update.failed_Update_attempts
      FROM
        accounts
      LEFT JOIN
        email_update USING(account_id)
      WHERE
        accounts.account_id = ?;`,
      [accountId]
    );

    const accountDetails = accountRows[0] as AccountDetails | undefined;

    if (!accountDetails) {
      await connection.rollback();
      res.status(404).json({ message: 'Account not found.', reason: 'accountNotFound' });

      return;
    }

    if (accountDetails.failed_sign_in_attempts >= ACCOUNT_FAILED_SIGN_IN_LIMIT) {
      await connection.rollback();
      res.status(403).json({ message: 'Account is locked', reason: 'accountLocked' });

      return;
    }

    if (!accountDetails.update_id) {
      await connection.rollback();
      res.status(404).json({ message: 'Email change request not found or has expired.', reason: 'requestNotFound' });

      return;
    }

    if (accountDetails.failed_update_attempts >= ACCOUNT_FAILED_UPDATE_LIMIT) {
      await connection.rollback();

      res.status(403).json({
        message: 'Email change request suspended.',
        reason: 'requestSuspended',
        resData: { expiryTimestamp: accountDetails.expiry_timestamp },
      });

      return;
    }

    if (accountDetails.confirmation_code !== confirmationCode) {
      await connection.rollback();

      const suspendRequest: boolean = accountDetails.failed_update_attempts + 1 >= ACCOUNT_FAILED_UPDATE_LIMIT;
      if (!suspendRequest) {
        await incrementedFailedEmailUpdateAttempts(accountDetails.update_id, dbPool, req);
        res.status(401).json({ message: 'Incorrect confirmation code.', reason: 'incorrectCode' });

        return;
      }

      const requestSuspended: boolean = await suspendEmailUpdateRequest(accountDetails.update_id, dbPool, req);
      if (!requestSuspended) {
        res.status(500).json({ message: 'Internal server error.' });
        return;
      }

      res.status(401).json({ message: 'Incorrect confirmation code. Request suspended', reason: 'incorrectCode_suspended' });
      return;
    }

    const [firstResultSetheader] = await connection.execute<ResultSetHeader>(
      `UPDATE
        accounts
      SET
        email = ?
      WHERE
        account_id = ?;`,
      [accountDetails.new_email, accountId]
    );

    const [secondResultSetHeader] = await connection.execute<ResultSetHeader>(
      `DELETE FROM
        email_update
      WHERE
        update_id = ?;`,
      [accountDetails.update_id]
    );

    const emailUpdated: boolean = firstResultSetheader.affectedRows > 0;
    const emailUpdateRequestDeleted: boolean = secondResultSetHeader.affectedRows > 0;

    if (!emailUpdated || !emailUpdateRequestDeleted) {
      await connection.rollback();
      res.status(500).json({ message: 'Internal server error.' });

      await logUnexpectedError(
        req,
        null,
        `Failed to complete email update process. Email updated: ${emailUpdated}. Request deleted: ${emailUpdateRequestDeleted}.`
      );

      return;
    }

    await connection.commit();
    res.json({});
  } catch (err: unknown) {
    console.log(err);
    await connection?.rollback();

    if (res.headersSent) {
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  } finally {
    connection?.release();
  }
});
