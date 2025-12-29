import express, { Router, Request, Response } from 'express';
import { undefinedValuesDetected } from '../util/validation/requestValidation';
import { isValidDisplayName, isValidEmail, isValidNewPassword, isValidPassword, isValidUsername } from '../util/validation/userValidation';
import { getRequestCookie, removeRequestCookie } from '../util/cookieUtils';
import { dbPool } from '../db/db';
import { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { generatePlaceHolders } from '../util/sqlUtils/generatePlaceHolders';
import { generateCryptoUuid, generateHexCode, isValidUuid, isValidHexCode } from '../util/tokenGenerator';
import {
  ACCOUNT_DELETION_WINDOW,
  ACCOUNT_EMAIL_UPDATE_WINDOW,
  ACCOUNT_EMAILS_SENT_LIMIT,
  ACCOUNT_FAILED_SIGN_IN_LIMIT,
  ACCOUNT_FAILED_ATTEMPTS_LIMIT,
  ACCOUNT_RECOVERY_WINDOW,
  ACCOUNT_VERIFICATION_WINDOW,
  ACCOUNT_SOCIAL_FETCH_BATCH_SIZE,
} from '../util/constants/accountConstants';
import {
  sendAccountDeletionEmailService,
  sendAccountRecoveryEmailService,
  sendAccountVerificationEmailService,
  sendEmailUpdateStartEmailService,
} from '../util/email/emailServices';
import { isSqlError } from '../util/sqlUtils/isSqlError';
import { logUnexpectedError } from '../logs/errorLogger';
import {
  deleteAccountById,
  deleteFollowRequest,
  handleIncorrectPassword,
  incrementAccountRequestEmailsSent,
  incrementFailedAccountRequestAttempts,
  resetFailedSignInAttempts,
  suspendAccountRequest,
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
    await connection.beginTransaction();

    type TakenStatus = {
      email_taken: boolean;
      email_temporarily_taken: boolean;
      username_taken: boolean;
    };

    const [takenStatusRows] = await connection.execute<RowDataPacket[]>(
      `SELECT
        EXISTS (SELECT 1 FROM accounts WHERE email = :email FOR UPDATE) AS email_taken,
        EXISTS (SELECT 1 FROM email_update WHERE new_email = :email FOR UPDATE) AS email_temporarily_taken,
        EXISTS (SELECT 1 FROM accounts WHERE username = :username FOR UPDATE) AS username_taken;`,
      { email, username }
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
        emails_sent,
        failed_attempts,
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
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
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

    if (!accountDetails || accountDetails.is_verified) {
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
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
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

  let connection: PoolConnection | null = null;

  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    type AccountDetails = {
      account_id: number;
      public_account_id: string;
      email: string;
      display_name: string;
      is_verified: boolean;
      verification_request_id: number;
      verification_token: string;
      emails_sent: number;
      failed_attempts: number;
    };

    const [accountRows] = await connection.execute<RowDataPacket[]>(
      `SELECT
        accounts.account_id,
        accounts.public_account_id,
        accounts.email,
        accounts.display_name,
        accounts.is_verified,
        
        account_verification.request_id AS verification_request_id,
        account_verification.verification_token,
        account_verification.emails_sent,
        account_verification.failed_attempts
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
      res.status(404).json({ message: 'Account not found.', reason: 'accountNotFound' });

      return;
    }

    if (accountDetails.is_verified) {
      await connection.rollback();
      res.status(409).json({ message: 'Account is already verified.', reason: 'alreadyVerified' });

      return;
    }

    if (!accountDetails.verification_request_id || accountDetails.failed_attempts >= ACCOUNT_FAILED_ATTEMPTS_LIMIT) {
      await connection.rollback();

      await deleteAccountById(accountDetails.account_id, dbPool, req);
      res.status(404).json({ message: 'Account not found.', reason: 'accountNotFound' });

      return;
    }

    if (accountDetails.emails_sent >= ACCOUNT_EMAILS_SENT_LIMIT) {
      await connection.rollback();
      res.status(403).json({ message: `Sent verification emails limit reached.`, reason: 'emailsSentLimitReached' });

      return;
    }

    await incrementAccountRequestEmailsSent('account_verification', accountDetails.verification_request_id, connection, req);

    await connection.commit();
    res.json({});

    await sendAccountVerificationEmailService({
      receiver: accountDetails.email,
      displayName: accountDetails.display_name,
      publicAccountId: accountDetails.public_account_id,
      verificationToken: accountDetails.verification_token,
    });
  } catch (err: unknown) {
    console.log(err);
    await connection?.rollback();

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  } finally {
    connection?.release();
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
      verification_request_id: number;
      verification_token: string;
      failed_attempts: number;
    };

    const [accountRows] = await connection.execute<RowDataPacket[]>(
      `SELECT
        accounts.account_id,
        accounts.is_verified,

        account_verification.request_id AS verification_request_id,
        account_verification.verification_token,
        account_verification.failed_attempts
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

    if (!accountDetails.verification_request_id || accountDetails.failed_attempts >= ACCOUNT_FAILED_ATTEMPTS_LIMIT) {
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

    if (accountDetails.failed_attempts + 1 >= ACCOUNT_FAILED_ATTEMPTS_LIMIT) {
      await deleteAccountById(accountDetails.account_id, dbPool, req);
      res.status(401).json({ message: 'Incorrect verification token.', reason: 'incorrectVerificationToken_deleted' });

      return;
    }

    await incrementFailedAccountRequestAttempts('account_verification', accountDetails.verification_request_id, dbPool, req);
    res.status(401).json({ message: 'Incorrect verification token.', reason: 'incorrectVerificationToken' });
  } catch (err: unknown) {
    console.log(err);
    connection?.rollback();

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
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

  let connection: PoolConnection | null = null;

  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    type AccountDetails = {
      account_id: number;
      hashed_password: string;
      is_verified: boolean;
      failed_sign_in_attempts: number;
    };

    const [accountRows] = await connection.execute<RowDataPacket[]>(
      `SELECT
        account_id,
        hashed_password,
        is_verified,
        failed_sign_in_attempts
      FROM
        accounts
      WHERE
        email = ?
      FOR UPDATE;`,
      [email]
    );

    const accountDetails = accountRows[0] as AccountDetails | undefined;

    if (!accountDetails || !accountDetails.is_verified) {
      await connection.rollback();
      res.status(404).json({ message: 'Account not found or is unverified.', reason: 'accountNotFound' });

      return;
    }

    if (accountDetails.failed_sign_in_attempts >= ACCOUNT_FAILED_SIGN_IN_LIMIT) {
      await connection.rollback();
      res.status(403).json({ message: 'Account is locked.', reason: 'accountLocked' });

      return;
    }

    const passwordIsCorrect: boolean = await bcrypt.compare(password, accountDetails.hashed_password);
    if (!passwordIsCorrect) {
      await connection.rollback();
      await handleIncorrectPassword(accountDetails.account_id, accountDetails.failed_sign_in_attempts, dbPool, req, res);

      return;
    }

    const authSessionCreated: boolean = await createAuthSession(res, connection, accountDetails.account_id, keepSignedIn);
    if (!authSessionCreated) {
      await connection.rollback();

      res.status(500).json({ message: 'Internal server error.' });
      await logUnexpectedError(req, null, 'Failed to create authSession.');

      return;
    }

    await connection.commit();
    res.json({});

    if (accountDetails.failed_sign_in_attempts > 0) {
      await resetFailedSignInAttempts(accountDetails.account_id, dbPool, req);
    }

    await dbPool.execute(
      `DELETE FROM
        account_recovery
      WHERE
        account_id = ?;`,
      [accountDetails.account_id]
    );
  } catch (err: unknown) {
    console.log(err);
    await connection?.rollback();

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  } finally {
    connection?.release();
  }
});

accountsRouter.get('/social', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

  if (!accountId) {
    return;
  }

  try {
    type Followers = {
      follow_id: number;
      follow_timestamp: number;
      public_account_id: string;
      username: string;
      display_name: string;
    };

    type Following = {
      follow_id: number;
      follow_timestamp: number;
      public_account_id: string;
      username: string;
      display_name: string;
    };

    type FollowRequests = {
      request_id: number;
      request_timestamp: number;
      public_account_id: string;
      username: string;
      display_name: string;
    };

    const [socialRows] = await dbPool.query<RowDataPacket[][]>(
      `SELECT
        followers.follow_id,
        followers.follow_timestamp,
        accounts.public_account_id,
        accounts.username,
        accounts.display_name
      FROM
        followers
      INNER JOIN
        accounts ON followers.follower_account_id = accounts.account_id
      WHERE
        followers.account_id = :accountId
      ORDER BY
        followers.follow_timestamp DESC
      LIMIT :socialFetchBatchSize;

      SELECT
        followers.follow_id,
        followers.follow_timestamp,
        accounts.public_account_id,
        accounts.username,
        accounts.display_name
      FROM
        followers
      INNER JOIN
        accounts ON followers.account_id = accounts.account_id
      WHERE
        followers.follower_account_id = :accountId
      ORDER BY
        followers.follow_timestamp DESC
      LIMIT :socialFetchBatchSize;
      
      SELECT
        follow_requests.request_id,
        follow_requests.request_timestamp,
        accounts.public_account_id,
        accounts.username,
        accounts.display_name
      FROM
        follow_requests
      INNER JOIN
        accounts ON follow_requests.requester_account_id = accounts.account_id
      WHERE
        follow_requests.requestee_account_id = :accountId
      ORDER BY
        follow_requests.request_timestamp DESC
      LIMIT :socialFetchBatchSize;`,
      { accountId, socialFetchBatchSize: ACCOUNT_SOCIAL_FETCH_BATCH_SIZE }
    );

    const followers = socialRows[0] as Followers[] | undefined;
    const following = socialRows[1] as Following[] | undefined;
    const followRequests = socialRows[2] as FollowRequests[] | undefined;

    if (!followers || !following || !followRequests) {
      res.status(500).json({ message: 'Internal server error.' });

      await logUnexpectedError(
        req,
        null,
        `Failed to fetch social data. Followers fetched: ${Boolean(followers)}. Following fetched: ${Boolean(
          following
        )}. Follow requests fetched: ${Boolean(followRequests)}.`
      );

      return;
    }

    res.json({ followers, following, followRequests });
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
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

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

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

    type OngoingAccountRequest = {
      request_id: number;
      is_suspended: boolean;
      expiry_timestamp: number;
    };

    const [accountRows] = await dbPool.query<RowDataPacket[][]>(
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
        accounts.account_id = :accountId;
      
      SELECT
        request_id,
        new_email,
        failed_attempts >= :failedAttemptsLimit AS is_suspended,
        expiry_timestamp
      FROM
        email_update
      WHERE
        account_id = :accountId;
      
      SELECT
        request_id,
        failed_attempts >= :failedAttemptsLimit AS is_suspended,
        expiry_timestamp
      FROM
        account_deletion
      WHERE
        account_id = :accountId;`,
      { accountId, failedAttemptsLimit: ACCOUNT_FAILED_ATTEMPTS_LIMIT }
    );

    const accountDetails = (accountRows[0] ? accountRows[0][0] : undefined) as AccountDetails | undefined;

    if (!accountDetails) {
      removeRequestCookie(res, 'authSessionId');
      res.status(404).json({ message: 'Account not found.', reason: 'accountNotFound' });

      return;
    }

    const ongoingEmailUpdateRequest = (accountRows[1] ? accountRows[1][0] : null) as (OngoingAccountRequest & { new_email: string }) | null;
    const ongoingAccountDeletionRequest = (accountRows[2] ? accountRows[2][0] : null) as
      | (OngoingAccountRequest & { new_email: string })
      | null;

    ongoingEmailUpdateRequest && (ongoingEmailUpdateRequest.is_suspended = Boolean(ongoingEmailUpdateRequest.is_suspended));
    ongoingAccountDeletionRequest && (ongoingAccountDeletionRequest.is_suspended = Boolean(ongoingAccountDeletionRequest.is_suspended));

    res.json({
      accountDetails,
      ongoingEmailUpdateRequest,
      ongoingAccountDeletionRequest,
    });
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
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

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

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
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
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

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

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
      removeRequestCookie(res, 'authSessionId');
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
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  }
});

accountsRouter.patch('/details/password', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  type RequestData = {
    password: string;
    newPassword: string;
  };

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['password', 'newPassword'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  const { password, newPassword } = requestData;

  if (!isValidPassword(password)) {
    res.status(400).json({ message: 'Invalid current password.', reason: 'invalidCurrentPassword' });
    return;
  }

  if (!isValidNewPassword(newPassword)) {
    res.status(400).json({ message: 'Invalid new password.', reason: 'invalidNewPassword' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

  if (!accountId) {
    return;
  }

  let connection: PoolConnection | null = null;

  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    type AccountDetails = {
      username: string;
      hashed_password: string;
      failed_sign_in_attempts: number;
    };

    const [accountRows] = await connection.execute<RowDataPacket[]>(
      `SELECT
        username,
        hashed_password,
        failed_sign_in_attempts
      FROM
        accounts
      WHERE
        account_id = ?
      FOR UPDATE;`,
      [accountId]
    );

    const accountDetails = accountRows[0] as AccountDetails | undefined;

    if (!accountDetails) {
      await connection.rollback();

      removeRequestCookie(res, 'authSessionId');
      res.status(404).json({ message: 'Account not found.', reason: 'accountNotFound' });

      return;
    }

    if (newPassword === accountDetails.username) {
      await connection.rollback();
      res.status(409).json({ message: `Username and password can't match.`, reason: 'newPasswordMatchesUsername' });

      return;
    }

    const passwordIsCorrect: boolean = await bcrypt.compare(password, accountDetails.hashed_password);
    if (!passwordIsCorrect) {
      await connection.rollback();
      await handleIncorrectPassword(accountId, accountDetails.failed_sign_in_attempts, dbPool, req, res);

      return;
    }

    if (newPassword === password) {
      await connection.rollback();
      res.status(409).json({ message: `New password can't match current password.`, reason: 'newPasswordMatchesUsername' });

      return;
    }

    const newHashedPassword: string = await bcrypt.hash(newPassword, 10);

    const [resultSetHeader] = await connection.execute<ResultSetHeader>(
      `UPDATE
        accounts
      SET
        hashed_password = ?,
        failed_sign_in_attempts = ?
      WHERE
        account_id = ?;`,
      [newHashedPassword, 0, accountId]
    );

    if (resultSetHeader.affectedRows === 0) {
      await connection.rollback();

      res.status(500).json({ message: 'Internal server error.' });
      await logUnexpectedError(req, null, 'Failed to update hashed_password.');

      return;
    }

    await connection.commit();
    res.json({});

    await purgeAuthSessions(accountId, authSessionId);

    if (accountDetails.failed_sign_in_attempts > 0) {
      await resetFailedSignInAttempts(accountId, dbPool, req);
    }
  } catch (err: unknown) {
    console.log(err);
    await connection?.rollback();

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  } finally {
    connection?.release();
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
    res.status(400).json({ message: 'Invalid email address.', reason: 'invalidEmail' });
    return;
  }

  if (!isValidPassword(password)) {
    res.status(400).json({ message: 'Invalid password.', reason: 'invalidPassword' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

  if (!accountId) {
    return;
  }

  let connection: PoolConnection | null = null;

  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    type AccountDetails = {
      email: string;
      hashed_password: string;
      display_name: string;
      failed_sign_in_attempts: number;

      request_id: number;
      new_email: string;
      expiry_timestamp: number;
      failed_attempts: number;

      email_taken: boolean;
      email_temporarily_taken: boolean;
    };

    const [accountRows] = await connection.execute<ResultSetHeader[]>(
      `SELECT
        accounts.email,
        accounts.hashed_password,
        accounts.display_name,
        accounts.failed_sign_in_attempts,

        email_update.request_id,
        email_update.new_email,
        email_update.expiry_timestamp,
        email_update.failed_attempts,

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

      removeRequestCookie(res, 'authSessionId');
      res.status(404).json({ message: 'Account not found.', reason: 'accountNotFound' });

      return;
    }

    const passwordIsCorrect: boolean = await bcrypt.compare(password, accountDetails.hashed_password);
    if (!passwordIsCorrect) {
      await connection.rollback();
      await handleIncorrectPassword(accountId, accountDetails.failed_sign_in_attempts, dbPool, req, res);

      return;
    }

    if (accountDetails.request_id) {
      await connection.rollback();

      res.status(409).json({
        message: 'Ongoing email change request found.',
        reason: 'ongoingRequest',
        resData: {
          new_email: accountDetails.new_email,
          expiry_timestamp: accountDetails.expiry_timestamp,
          is_suspended: accountDetails.failed_attempts >= ACCOUNT_FAILED_ATTEMPTS_LIMIT,
        },
      });

      return;
    }

    if (newEmail === accountDetails.email) {
      await connection.rollback();
      res.status(409).json({ message: 'Email already linked to this account.', reason: 'duplicateEmail' });

      return;
    }

    const confirmationCode: string = generateHexCode();
    const expiryTimestamp: number = Date.now() + ACCOUNT_EMAIL_UPDATE_WINDOW;

    await connection.execute(
      `INSERT INTO email_update (
        account_id,
        new_email,
        confirmation_code,
        expiry_timestamp,
        emails_sent,
        failed_attempts
      ) VALUES (${generatePlaceHolders(6)});`,
      [accountId, newEmail, confirmationCode, expiryTimestamp, 1, 0]
    );

    await connection.commit();
    res.json({ expiryTimestamp });

    if (accountDetails.failed_sign_in_attempts > 0) {
      await resetFailedSignInAttempts(accountId, dbPool, req);
    }

    await sendEmailUpdateStartEmailService({
      receiver: newEmail,
      confirmationCode,
      displayName: accountDetails.display_name,
    });
  } catch (err: unknown) {
    console.log(err);
    await connection?.rollback();

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
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

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

  if (!accountId) {
    return;
  }

  let connection: PoolConnection | null = null;

  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    type AccountDetails = {
      display_name: string;
      request_id: number;
      new_email: string;
      confirmation_code: string;
      expiry_timestamp: number;
      emails_sent: number;
      failed_attempts: number;
    };

    const [accountRows] = await connection.execute<RowDataPacket[]>(
      `SELECT
        accounts.display_name,

        email_update.request_id,
        email_update.new_email,
        email_update.confirmation_code,
        email_update.expiry_timestamp,
        email_update.emails_sent,
        email_update.failed_attempts
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

      removeRequestCookie(res, 'authSessionId');
      res.status(404).json({ message: 'Account not found.', reason: 'accountNotFound' });

      return;
    }

    if (!accountDetails.request_id) {
      await connection.rollback();
      res.status(404).json({ message: 'Email change request not found or has expired.', reason: 'requestNotFound' });

      return;
    }

    if (accountDetails.failed_attempts >= ACCOUNT_FAILED_ATTEMPTS_LIMIT) {
      await connection.rollback();

      res.status(403).json({
        message: 'Email change request suspended.',
        reason: 'requestSuspended',
        resData: { expiryTimestamp: accountDetails.expiry_timestamp },
      });

      return;
    }

    if (accountDetails.emails_sent >= ACCOUNT_EMAILS_SENT_LIMIT) {
      await connection.rollback();
      res.status(403).json({ message: `Sent confirmation emails limit reached.`, reason: 'emailsSentLimitReached' });

      return;
    }

    await incrementAccountRequestEmailsSent('email_update', accountDetails.request_id, connection, req);

    await connection.commit();
    res.json({});

    await sendEmailUpdateStartEmailService({
      receiver: accountDetails.new_email,
      displayName: accountDetails.display_name,
      confirmationCode: accountDetails.confirmation_code,
    });
  } catch (err: unknown) {
    console.log(err);
    await connection?.rollback();

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
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

  if (!isValidHexCode(confirmationCode)) {
    res.status(400).json({ message: 'Invalid confirmation code.', reason: 'invalidCode' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

  if (!accountId) {
    return;
  }

  let connection: PoolConnection | null = null;

  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    type RequestDetails = {
      request_id: number;
      new_email: string;
      confirmation_code: string;
      failed_attempts: number;
      expiry_timestamp: number;
    };

    const [requestRows] = await connection.execute<RowDataPacket[]>(
      `SELECT
        request_id,
        new_email,
        confirmation_code,
        expiry_timestamp,
        failed_attempts
      FROM
        email_update
      WHERE
        account_id = ?;`,
      [accountId]
    );

    const requestDetails = requestRows[0] as RequestDetails | undefined;

    if (!requestDetails) {
      await connection.rollback();
      res.status(404).json({ message: 'Email change request not found or has expired.', reason: 'requestNotFound' });

      return;
    }

    if (requestDetails.failed_attempts >= ACCOUNT_FAILED_ATTEMPTS_LIMIT) {
      await connection.rollback();

      res.status(403).json({
        message: 'Email change request suspended.',
        reason: 'requestSuspended',
        resData: { expiryTimestamp: requestDetails.expiry_timestamp },
      });

      return;
    }

    if (requestDetails.confirmation_code !== confirmationCode) {
      await connection.rollback();

      const suspendRequest: boolean = requestDetails.failed_attempts + 1 >= ACCOUNT_FAILED_ATTEMPTS_LIMIT;
      if (!suspendRequest) {
        await incrementFailedAccountRequestAttempts('email_update', requestDetails.request_id, dbPool, req);
        res.status(401).json({ message: 'Incorrect confirmation code.', reason: 'incorrectCode' });

        return;
      }

      const expiryTimestamp: number | null = await suspendAccountRequest('email_update', requestDetails.request_id, dbPool, req);
      if (!expiryTimestamp) {
        res.status(500).json({ message: 'Internal server error.' });
        return;
      }

      res.status(401).json({
        message: 'Incorrect confirmation code.',
        reason: 'incorrectCode_suspended',
        resData: { expiryTimestamp },
      });
      return;
    }

    const [firstResultSetheader] = await connection.execute<ResultSetHeader>(
      `UPDATE
        accounts
      SET
        email = ?
      WHERE
        account_id = ?;`,
      [requestDetails.new_email, accountId]
    );

    const [secondResultSetHeader] = await connection.execute<ResultSetHeader>(
      `DELETE FROM
        email_update
      WHERE
        request_id = ?;`,
      [requestDetails.request_id]
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
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  } finally {
    connection?.release();
  }
});

accountsRouter.post('/recovery/start', async (req: Request, res: Response) => {
  const isSignedIn: boolean = getRequestCookie(req, 'authSessionId') !== null;
  if (isSignedIn) {
    res.status(403).json({ message: `Can't recover an account while signed in.`, reason: 'signedIN' });
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

  let connection: PoolConnection | null = null;

  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    type AccountDetails = {
      account_id: number;
      public_account_id: string;
      display_name: string;
      is_verified: boolean;
      request_id: number;
      expiry_timestamp: number;
      failed_attempts: number;
    };

    const [accountRows] = await connection.execute<RowDataPacket[]>(
      `SELECT
        accounts.account_id,
        accounts.public_account_id,
        accounts.display_name,
        accounts.is_verified,

        account_recovery.request_id,
        account_recovery.expiry_timestamp,
        account_recovery.failed_attempts
      FROM
        accounts
      LEFT JOIN
        account_recovery USING(account_id)
      WHERE
        accounts.email = ?
      FOR UPDATE;`,
      [email]
    );

    const accountDetails = accountRows[0] as AccountDetails | undefined;

    if (!accountDetails || !accountDetails.is_verified) {
      await connection.rollback();
      res.status(404).json({ message: 'Account not found or is unverified.', reason: 'accountNotFound' });

      return;
    }

    if (!accountDetails.request_id) {
      const recoveryToken: string = generateCryptoUuid();
      const expiryTimestamp: number = Date.now() + ACCOUNT_RECOVERY_WINDOW;

      await connection.execute<ResultSetHeader>(
        `INSERT INTO account_recovery (
          account_id,
          recovery_token,
          expiry_timestamp,
          emails_sent,
          failed_attempts
        ) VALUES (${generatePlaceHolders(5)});`,
        [accountDetails.account_id, recoveryToken, expiryTimestamp, 1, 0]
      );

      await connection.commit();
      res.json({ publicAccountId: accountDetails.public_account_id });

      await sendAccountRecoveryEmailService({
        receiver: email,
        displayName: accountDetails.display_name,
        publicAccountId: accountDetails.public_account_id,
        recoveryToken,
      });

      return;
    }

    await connection.rollback();

    if (accountDetails.failed_attempts >= ACCOUNT_FAILED_ATTEMPTS_LIMIT) {
      res.status(403).json({
        message: 'Recovery request suspended.',
        reason: 'requestSuspended',
        resData: { expiryTimestamp: accountDetails.expiry_timestamp },
      });

      return;
    }

    res.status(409).json({
      message: 'Ongoing recovery request found.',
      reason: 'ongoingRequestFound',
      resData: { publicAccountId: accountDetails.public_account_id },
    });
  } catch (err: unknown) {
    console.log(err);
    await connection?.rollback();

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  } finally {
    connection?.release();
  }
});

accountsRouter.patch('/recovery/resendEmail', async (req: Request, res: Response) => {
  const isSignedIn: boolean = getRequestCookie(req, 'authSessionId') !== null;
  if (isSignedIn) {
    res.status(403).json({ message: `Can't recover an account while signed in.`, reason: 'signedIN' });
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
    res.status(400).json({ message: 'Invalid account ID.', reason: 'invalidPublicAccountId' });
    return;
  }

  let connection: PoolConnection | null = null;

  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    type AccountDetails = {
      email: string;
      display_name: string;
      is_verified: boolean;
      request_id: number;
      recovery_token: string;
      expiry_timestamp: number;
      emails_sent: number;
      failed_attempts: number;
    };

    const [accountRows] = await connection.execute<RowDataPacket[]>(
      `SELECT
        accounts.email,
        accounts.display_name,
        accounts.is_verified,

        account_recovery.request_id,
        account_recovery.recovery_token,
        account_recovery.expiry_timestamp,
        account_recovery.emails_sent,
        account_recovery.failed_attempts
      FROM
        accounts
      LEFT JOIN
        account_recovery USING(account_id)
      WHERE
        accounts.public_account_id = ?
      FOR UPDATE;`,
      [publicAccountId]
    );

    const accountDetails = accountRows[0] as AccountDetails | undefined;

    if (!accountDetails || !accountDetails.is_verified) {
      await connection.rollback();
      res.status(404).json({ message: 'Account not found or is unverified.', reason: 'accountNotFound' });

      return;
    }

    if (!accountDetails.request_id) {
      await connection.rollback();
      res.status(404).json({ message: 'Recovery request not found.', reason: 'requestNotFound' });

      return;
    }

    if (accountDetails.failed_attempts >= ACCOUNT_FAILED_ATTEMPTS_LIMIT) {
      await connection.rollback();

      res.status(403).json({
        message: 'Recovery request suspended.',
        reason: 'requestSuspended',
        resData: { expiryTimestamp: accountDetails.expiry_timestamp },
      });

      return;
    }

    if (accountDetails.emails_sent >= ACCOUNT_EMAILS_SENT_LIMIT) {
      await connection.rollback();
      res.status(403).json({ message: 'Sent recovery emails limit reached.', reason: 'emailsSentLimitReached' });

      return;
    }

    await incrementAccountRequestEmailsSent('account_recovery', accountDetails.request_id, connection, req);

    await connection.commit();
    res.json({});

    await sendAccountRecoveryEmailService({
      receiver: accountDetails.email,
      displayName: accountDetails.display_name,
      publicAccountId,
      recoveryToken: accountDetails.recovery_token,
    });
  } catch (err: unknown) {
    console.log(err);
    await connection?.rollback();

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  } finally {
    connection?.release();
  }
});

accountsRouter.patch('/recovery/confirm', async (req: Request, res: Response) => {
  const isSignedIn: boolean = getRequestCookie(req, 'authSessionId') !== null;
  if (isSignedIn) {
    res.status(403).json({ message: `Can't recover an account while signed in.`, reason: 'signedIN' });
    return;
  }

  type RequestData = {
    publicAccountId: string;
    recoveryToken: string;
    newPassword: string;
  };

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['publicAccountId', 'recoveryToken', 'newPassword'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  const { publicAccountId, recoveryToken, newPassword } = requestData;

  if (!isValidUuid(publicAccountId)) {
    res.status(400).json({ message: 'Invalid account ID.', reason: 'invalidAccountId' });
    return;
  }

  if (!isValidUuid(recoveryToken)) {
    res.status(400).json({ message: 'Invalid recovery token.', reason: 'invalidRecoveryToken' });
    return;
  }

  if (!isValidNewPassword(newPassword)) {
    res.status(400).json({ message: 'Invalid new password.', reason: 'invalidNewPassword' });
    return;
  }

  let connection: PoolConnection | null = null;

  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    type AccountDetails = {
      account_id: number;
      username: string;
      is_verified: boolean;
      request_id: number;
      recovery_token: string;
      expiry_timestamp: number;
      failed_attempts: number;
    };

    const [accountRows] = await connection.execute<RowDataPacket[]>(
      `SELECT
        accounts.account_id,
        accounts.username,
        accounts.is_verified,

        account_recovery.request_id,
        account_recovery.recovery_token,
        account_recovery.expiry_timestamp,
        account_recovery.failed_attempts
      FROM
        accounts
      LEFT JOIN
        account_recovery USING(account_id)
      WHERE
        accounts.public_account_id = ?
      FOR UPDATE;`,
      [publicAccountId]
    );

    const accountDetails = accountRows[0] as AccountDetails | undefined;

    if (!accountDetails || !accountDetails.is_verified) {
      await connection.rollback();
      res.status(404).json({ message: 'Account not found or is unverified.', reason: 'accountNotFound' });

      return;
    }

    if (!accountDetails.account_id) {
      await connection.rollback();
      res.status(404).json({ message: 'Recovery request not found.', reason: 'requestNotFound' });

      return;
    }

    if (accountDetails.failed_attempts >= ACCOUNT_FAILED_ATTEMPTS_LIMIT) {
      await connection.rollback();

      res.status(403).json({
        message: 'Recovery request suspended.',
        reason: 'requestSuspended',
        resData: { expiryTimestamp: accountDetails.expiry_timestamp },
      });

      return;
    }

    if (accountDetails.recovery_token !== recoveryToken) {
      await connection.rollback();

      const suspendRequest: boolean = accountDetails.failed_attempts + 1 >= ACCOUNT_FAILED_ATTEMPTS_LIMIT;
      if (!suspendRequest) {
        await incrementFailedAccountRequestAttempts('account_recovery', accountDetails.request_id, dbPool, req);
        res.status(401).json({ message: 'Incorrect recovery token.', reason: 'incorrectToken' });

        return;
      }

      const expiryTimestamp: number | null = await suspendAccountRequest('account_recovery', accountDetails.request_id, dbPool, req);
      if (!expiryTimestamp) {
        res.status(500).json({ message: 'Internal server error.' });
        return;
      }

      res.status(401).json({
        message: 'Incorrect recovery token.',
        reason: 'incorrectToken_suspended',
        resData: { expiryTimestamp },
      });
      return;
    }

    if (accountDetails.username === newPassword) {
      await connection.rollback();
      res.status(409).json({ message: `Username and new password can't match.`, reason: 'newPasswordMatchesUsername' });

      return;
    }

    const newHashedPassword: string = await bcrypt.hash(newPassword, 10);

    const [firstResultSetheader] = await connection.execute<ResultSetHeader>(
      `UPDATE
        accounts
      SET
        hashed_password = ?,
        failed_sign_in_attempts = ?
      WHERE
        account_id = ?;`,
      [newHashedPassword, 0, accountDetails.account_id]
    );

    const [secondResultSetHeader] = await connection.execute<ResultSetHeader>(
      `DELETE FROM
        account_recovery
      WHERE
        request_id = ?;`,
      [accountDetails.request_id]
    );

    const accountRecovered: boolean = firstResultSetheader.affectedRows > 0;
    const recoveryRequestDeleted: boolean = secondResultSetHeader.affectedRows > 0;

    if (!accountRecovered || !recoveryRequestDeleted) {
      await connection.rollback();
      res.status(500).json({ message: 'Internal server error.' });

      await logUnexpectedError(
        req,
        null,
        `Failed to complete email update process. Account recovered: ${accountRecovered}. Request deleted: ${recoveryRequestDeleted}.`
      );

      return;
    }

    connection.commit();
    res.json({});

    await purgeAuthSessions(accountDetails.account_id);
  } catch (err: unknown) {
    console.log(err);
    await connection?.rollback();

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  } finally {
    connection?.release();
  }
});

accountsRouter.post('/deletion/start', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  type RequestData = {
    password: string;
  };

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['password'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  const { password } = requestData;

  if (!isValidPassword(password)) {
    res.status(400).json({ message: 'Invalid password.', reason: 'invalidPassword' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

  if (!accountId) {
    return;
  }

  let connection: PoolConnection | null = null;

  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    type AccountDetails = {
      email: string;
      hashed_password: string;
      display_name: string;
      is_verified: boolean;
      failed_sign_in_attempts: number;
      request_id: number;
      expiry_timestamp: number;
      failed_attempts: number;
    };

    const [accountRows] = await connection.execute<RowDataPacket[]>(
      `SELECT
        accounts.email,
        accounts.hashed_password,
        accounts.display_name,
        accounts.is_verified,
        accounts.failed_sign_in_attempts,
        
        account_deletion.request_id,
        account_deletion.expiry_timestamp,
        account_deletion.failed_attempts
      FROM
        accounts
      LEFT JOIN
        account_deletion USING(account_id)
      WHERE
        accounts.account_id = ?
      FOR UPDATE;`,
      [accountId]
    );

    const accountDetails = accountRows[0] as AccountDetails | undefined;

    if (!accountDetails || !accountDetails.is_verified) {
      await connection.rollback();

      removeRequestCookie(res, 'authSessionId');
      res.status(404).json({ message: 'Account not found or is unverified.', reason: 'accountNotFound' });

      return;
    }

    const passwordIsCorrect: boolean = await bcrypt.compare(password, accountDetails.hashed_password);
    if (!passwordIsCorrect) {
      await connection.rollback();
      await handleIncorrectPassword(accountId, accountDetails.failed_sign_in_attempts, dbPool, req, res);

      return;
    }

    if (accountDetails.request_id) {
      await connection.rollback();

      res.status(409).json({
        message: 'Ongoing deletion request found.',
        reason: 'ongoingRequest',
        resData: {
          expiry_timestamp: accountDetails.expiry_timestamp,
          is_suspended: accountDetails.failed_attempts >= ACCOUNT_FAILED_ATTEMPTS_LIMIT,
        },
      });

      return;
    }

    const expiryTimestamp: number = Date.now() + ACCOUNT_DELETION_WINDOW;
    const confirmationCode: string = generateHexCode();

    await connection.execute(
      `INSERT INTO account_deletion (
        account_id,
        confirmation_code,
        expiry_timestamp,
        emails_sent,
        failed_attempts
      ) VALUES (${generatePlaceHolders(5)});`,
      [accountId, confirmationCode, expiryTimestamp, 1, 0]
    );

    await connection.commit();
    res.json({ expiryTimestamp });

    await sendAccountDeletionEmailService({
      receiver: accountDetails.email,
      displayName: accountDetails.display_name,
      confirmationCode,
    });

    if (accountDetails.failed_sign_in_attempts > 0) {
      await resetFailedSignInAttempts(accountId, dbPool, req);
    }
  } catch (err: unknown) {
    console.log(err);
    await connection?.rollback();

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  } finally {
    connection?.release();
  }
});

accountsRouter.patch('/deletion/resendEmail', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

  if (!accountId) {
    return;
  }

  let connection: PoolConnection | null = null;

  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    type AccountDetails = {
      email: string;
      display_name: string;
      request_id: number;
      confirmation_code: string;
      emails_sent: number;
      failed_attempts: number;
      expiry_timestamp: number;
    };

    const [accountRows] = await connection.execute<RowDataPacket[]>(
      `SELECT
        accounts.email,
        accounts.display_name,
        
        account_deletion.request_id,
        account_deletion.confirmation_code,
        account_deletion.emails_sent,
        account_deletion.failed_attempts,
        account_deletion.expiry_timestamp
      FROM
        accounts
      LEFT JOIN
        account_deletion USING(account_id)
      WHERE
        accounts.account_id = ?
      FOR UPDATE;`,
      [accountId]
    );

    const accountDetails = accountRows[0] as AccountDetails | undefined;

    if (!accountDetails) {
      await connection.rollback();

      removeRequestCookie(res, 'authSessionId');
      res.status(404).json({ message: 'Account not found or is unverified.', reason: 'accountNotFound' });

      return;
    }

    if (accountDetails.failed_attempts >= ACCOUNT_FAILED_ATTEMPTS_LIMIT) {
      await connection.rollback();

      res.status(403).json({
        message: 'Deletion request suspended.',
        reason: 'requestSuspended',
        resData: { expiryTimestamp: accountDetails.expiry_timestamp },
      });

      return;
    }

    if (accountDetails.emails_sent >= ACCOUNT_EMAILS_SENT_LIMIT) {
      await connection.rollback();
      res.status(403).json({ message: 'Sent confirmation emails limit reached.', reason: 'emailsSentLimitReached' });

      return;
    }

    await incrementAccountRequestEmailsSent('account_deletion', accountDetails.request_id, connection, req);

    await connection.commit();
    res.json({});

    await sendAccountDeletionEmailService({
      receiver: accountDetails.email,
      displayName: accountDetails.display_name,
      confirmationCode: accountDetails.confirmation_code,
    });
  } catch (err: unknown) {
    console.log(err);
    await connection?.rollback();

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  } finally {
    connection?.release();
  }
});

accountsRouter.delete('/deletion/confirm/:confirmationCode', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  const confirmationCode: string | undefined = req.params.confirmationCode;

  if (!confirmationCode || !isValidHexCode(confirmationCode)) {
    res.status(400).json({ message: 'Invalid confirmation code.', reason: 'invalidCode' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

  if (!accountId) {
    return;
  }

  let connection: PoolConnection | null = null;

  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    type RequestDetails = {
      request_id: number;
      confirmation_code: string;
      failed_attempts: number;
      expiry_timestamp: number;
    };

    const [requestRows] = await connection.execute<RowDataPacket[]>(
      `SELECT
        request_id,
        confirmation_code,
        failed_attempts,
        expiry_timestamp
      FROM
        account_deletion
      WHERE
        account_id = ?
      FOR UPDATE;`,
      [accountId]
    );

    const requestDetails = requestRows[0] as RequestDetails | undefined;

    if (!requestDetails) {
      await connection.rollback();
      res.status(404).json({ message: 'Deletion request not found or has expired.', reason: 'requestNotFound' });

      return;
    }

    if (requestDetails.failed_attempts >= ACCOUNT_FAILED_ATTEMPTS_LIMIT) {
      await connection.rollback();

      res.status(403).json({
        message: 'Deletion request suspended.',
        reason: 'requestSuspended',
        resData: { expiryTimestamp: requestDetails.expiry_timestamp },
      });

      return;
    }

    if (requestDetails.confirmation_code !== confirmationCode) {
      await connection.rollback();

      const suspendRequest: boolean = requestDetails.failed_attempts + 1 >= ACCOUNT_FAILED_ATTEMPTS_LIMIT;
      if (!suspendRequest) {
        await incrementFailedAccountRequestAttempts('account_deletion', requestDetails.request_id, dbPool, req);
        res.status(401).json({ message: 'Incorrect confirmation code.', reason: 'incorrectCode' });

        return;
      }

      const expiryTimestamp: number | null = await suspendAccountRequest('account_deletion', requestDetails.request_id, dbPool, req);
      if (!expiryTimestamp) {
        res.status(500).json({ message: 'Internal server error.' });
        return;
      }

      res.status(401).json({
        message: 'Incorrect confirmation code.',
        reason: 'incorrectCode_suspended',
        resData: { expiryTimestamp },
      });
      return;
    }

    const [resultSetHeader] = await connection.execute<ResultSetHeader>(
      `DELETE FROM
        accounts
      WHERE
        account_id = ?;`,
      [accountId]
    );

    if (resultSetHeader.affectedRows === 0) {
      await connection.rollback();

      res.status(500).json({ message: 'Internal server error.' });
      await logUnexpectedError(req, null, 'Failed to delete account.');

      return;
    }

    removeRequestCookie(res, 'authSessionId');

    await connection.commit();
    res.json({});
  } catch (err: unknown) {
    console.log(err);
    await connection?.rollback();

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  } finally {
    connection?.release();
  }
});

accountsRouter.post('/followRequests/send', async (req: Request, res: Response) => {
  const authSessionOd: string | null = getAuthSessionId(req, res);

  if (!authSessionOd) {
    return;
  }

  type RequestData = {
    requesteePublicAccountId: string;
  };

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['requesteePublicAccountId'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  const { requesteePublicAccountId } = requestData;

  if (!isValidUuid(requesteePublicAccountId)) {
    res.status(400).json({ message: 'Invalid account ID.', reason: 'invalidPublicAccountId' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionOd, req, res);

  if (!accountId) {
    return;
  }

  try {
    type FollowDetails = {
      requestee_account_id: number;
      requestee_is_verified: boolean;
      follow_requires_approval: boolean;
      already_following: boolean;
      already_requested: boolean;
    };

    const [followRows] = await dbPool.execute<RowDataPacket[]>(
      `SELECT
        account_id AS requestee_account_id,
        is_verified AS requestee_is_verified,

        (SELECT approve_follow_requests FROM account_preferences WHERE account_id = accounts.account_id) AS follow_requires_approval,

        EXISTS (
          SELECT 1 FROM followers WHERE follower_account_id = :accountId AND account_id = accounts.account_id
        ) AS already_following,

        EXISTS (
          SELECT 1 FROM follow_requests WHERE requester_account_id = :accountId AND requestee_account_id = accounts.account_id
        ) AS already_requested
      FROM
        accounts
      WHERE
        public_account_id = :requesteePublicAccountId;`,
      { accountId, requesteePublicAccountId }
    );

    const followDetails = followRows[0] as FollowDetails | undefined;

    if (!followDetails || !followDetails.requestee_is_verified) {
      res.status(404).json({ message: 'Account not found or is unverified.', reason: 'accountNotFound' });
      return;
    }

    if (followDetails.requestee_account_id === accountId) {
      res.status(409).json({ message: `Can't follow yourself.`, reason: 'selfFollow' });
      return;
    }

    if (followDetails.already_following) {
      res.status(409).json({ message: 'Already following this user.', reason: 'alreadyFollowing' });
      return;
    }

    if (followDetails.already_requested) {
      res.status(409).json({ message: 'Follow request already sent.', reason: 'alreadySent' });
      return;
    }

    const currentTimestamp: number = Date.now();

    if (!followDetails.follow_requires_approval) {
      const [resultSetHeader] = await dbPool.execute<ResultSetHeader>(
        `INSERT INTO followers (
          account_id,
          follower_account_id,
          follow_timestamp
        ) VALUES (${generatePlaceHolders(3)});`,
        [followDetails.requestee_account_id, accountId, currentTimestamp]
      );

      res.json({ followId: resultSetHeader.insertId, followTimestamp: currentTimestamp });
      return;
    }

    const [resultSetHeader] = await dbPool.execute<ResultSetHeader>(
      `INSERT INTO follow_requests (
        requester_account_id,
        requestee_account_id,
        request_timestamp
      ) VALUES (${generatePlaceHolders(3)})`,
      [accountId, followDetails.requestee_account_id, currentTimestamp]
    );

    res.json({ requestId: resultSetHeader.insertId, requestTimestamp: currentTimestamp });
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
      return;
    }

    if (!isSqlError(err)) {
      res.status(500).json({ message: 'Internal server error.' });
      await logUnexpectedError(req, err);

      return;
    }

    if (err.errno === 1452) {
      res.status(409).json({ message: 'Follow request already sent.', reason: 'alreadySent' });
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  }
});

accountsRouter.delete('/followRequests/cancel/:requestId', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  const requestId: number | undefined = req.params.requestId ? +req.params.requestId : undefined;

  if (!requestId || !Number.isInteger(requestId)) {
    res.status(400).json({ messagE: 'Invalid request ID.', reason: 'invalidRequestId' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

  if (!accountId) {
    return;
  }

  try {
    await dbPool.execute<ResultSetHeader>(
      `DELETE FROM
        follow_requests
      WHERE
        request_id = ? AND
        requester_account_id = ?;`,
      [requestId, accountId]
    );

    res.json({});
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  }
});

accountsRouter.post('/followRequests/accept', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  type RequestData = {
    requestId: number;
  };

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['requestId'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  const { requestId } = requestData;

  if (!Number.isInteger(requestId)) {
    res.status(400).json({ message: 'Invalid request ID.', reason: 'invalidRequestId' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

  if (!accountId) {
    return;
  }

  let connection: PoolConnection | null = null;

  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    type FollowDetails = {
      requester_account_id: number;
      requester_already_following: boolean;
    };

    const [followRows] = await connection.execute<RowDataPacket[]>(
      `SELECT
        requester_account_id,
        EXISTS (
          SELECT 1 FROM followers WHERE account_id = :accountId AND follower_account_id = follow_requests.requester_account_id
        ) AS requester_already_following
      FROM
        follow_requests
      WHERE
        request_id = :requestId AND
        requestee_account_id = :accountId;`,
      { requestId, accountId }
    );

    const followDetails = followRows[0] as FollowDetails | undefined;

    if (!followDetails) {
      await connection.rollback();
      res.status(404).json({ message: 'Follow request not found.', reason: 'requestNotFound' });

      return;
    }

    if (followDetails.requester_already_following) {
      const followRequestDeleted: boolean = await deleteFollowRequest(requestId, connection, req);
      if (!followRequestDeleted) {
        await connection.rollback();

        res.status(500).json({ message: 'Internal server error.' });
        return;
      }

      await connection.commit();
      res.json({});

      return;
    }

    const followTimestamp: number = Date.now();

    const [resultSetHeader] = await connection.execute<ResultSetHeader>(
      `INSERT INTO followers (
        account_id,
        follower_account_Id,
        follow_timestamp
      ) VALUES (${generatePlaceHolders(3)});`,
      [accountId, followDetails.requester_account_id, followTimestamp]
    );

    const followRequestDeleted: boolean = await deleteFollowRequest(requestId, connection, req);
    if (!followRequestDeleted) {
      await connection.rollback();

      res.status(500).json({ message: 'Internal server error.' });
      return;
    }

    await connection.commit();
    res.json({ follow_id: resultSetHeader.insertId, follow_timestamp: followTimestamp });
  } catch (err: unknown) {
    console.log(err);
    await connection?.rollback();

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  } finally {
    connection?.release();
  }
});

accountsRouter.delete('/followRequests/decline/:requestId', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  const requestId: number | undefined = req.params.requestId ? +req.params.requestId : undefined;

  if (!requestId || !Number.isInteger(requestId)) {
    res.status(400).json({ messagE: 'Invalid request ID.', reason: 'invalidRequestId' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

  if (!accountId) {
    return;
  }

  try {
    await dbPool.execute<ResultSetHeader>(
      `DELETE FROM
        follow_requests
      WHERE
        request_id = ? AND
        requestee_account_id = ?;`,
      [requestId, accountId]
    );

    res.json({});
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  }
});

accountsRouter.delete('/followers/unfollow/:followId', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  const followId: number | undefined = req.params.followId ? +req.params.followId : undefined;

  if (!followId || !Number.isInteger(followId)) {
    res.status(400).json({ messagE: 'Invalid follow ID.', reason: 'invalidFollowId' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

  if (!accountId) {
    return;
  }

  try {
    await dbPool.execute<ResultSetHeader>(
      `DELETE FROM
        followers
      WHERE
        follow_id = ? AND
        follower_account_id = ?;`,
      [followId, accountId]
    );

    res.json({});
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  }
});

accountsRouter.delete('/followers/remove/:followId', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  const followId: number | undefined = req.params.followId ? +req.params.followId : undefined;

  if (!followId || !Number.isInteger(followId)) {
    res.status(400).json({ messagE: 'Invalid follow ID.', reason: 'invalidFollowId' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

  if (!accountId) {
    return;
  }

  try {
    await dbPool.execute<ResultSetHeader>(
      `DELETE FROM
        followers
      WHERE
        follow_id = ? AND
        account_id = ?;`,
      [followId, accountId]
    );

    res.json({});
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  }
});
