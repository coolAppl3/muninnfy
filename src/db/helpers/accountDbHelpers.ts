import { Request, Response } from 'express';
import { Pool, PoolConnection, ResultSetHeader } from 'mysql2/promise';
import { logUnexpectedError } from '../../logs/errorLogger';
import {
  ACCOUNT_UPDATE_SUSPENSION_DURATION,
  ACCOUNT_FAILED_SIGN_IN_LIMIT,
  ACCOUNT_FAILED_UPDATE_LIMIT,
} from '../../util/constants/accountConstants';
import { removeRequestCookie } from '../../util/cookieUtils';
import { purgeAuthSessions } from '../../auth/authSessions';

export async function deleteAccountById(accountId: number, executor: Pool | PoolConnection, req: Request): Promise<boolean> {
  try {
    const [resultSetHeader] = await executor.execute<ResultSetHeader>(
      `DELETE FROM
        accounts
      WHERE
        account_id = ?;`,
      [accountId]
    );

    return resultSetHeader.affectedRows > 0;
  } catch (err: unknown) {
    console.log(err);
    await logUnexpectedError(req, err, 'Failed to delete account.');

    return false;
  }
}

export async function incrementVerificationEmailsSent(
  verificationId: number,
  executor: Pool | PoolConnection,
  req: Request
): Promise<boolean> {
  try {
    const [resultSetHeader] = await executor.execute<ResultSetHeader>(
      `UPDATE
        account_verification
      SET
        verification_emails_sent = verification_emails_sent + 1
      WHERE
        verification_id = ?;`,
      [verificationId]
    );

    return resultSetHeader.affectedRows > 0;
  } catch (err: unknown) {
    console.log(err);
    await logUnexpectedError(req, err, 'Failed to increment verification_emails_sent.');

    return false;
  }
}

export async function incrementFailedVerificationAttempts(
  verificationId: number,
  executor: Pool | PoolConnection,
  req: Request
): Promise<boolean> {
  try {
    const [resultSetHeader] = await executor.execute<ResultSetHeader>(
      `UPDATE
        account_verification
      SET
        failed_verification_attempts = failed_verification_attempts + 1
      WHERE
        verification_id = ?;`,
      [verificationId]
    );

    return resultSetHeader.affectedRows > 0;
  } catch (err: unknown) {
    console.log(err);
    await logUnexpectedError(req, err, 'Failed to increment failed_verification_attempts.');

    return false;
  }
}

export async function incrementEmailUpdateEmailsSent(
  emailUpdateId: number,
  executor: Pool | PoolConnection,
  req: Request
): Promise<boolean> {
  try {
    const [resultSetHeader] = await executor.execute<ResultSetHeader>(
      `UPDATE
        email_update
      SET
        update_emails_sent = update_emails_sent + 1
      WHERE
        update_id = ?;`,
      [emailUpdateId]
    );

    return resultSetHeader.affectedRows > 0;
  } catch (err: unknown) {
    console.log(err);
    await logUnexpectedError(req, err, 'Failed to increment update_emails_sent.');

    return false;
  }
}

export async function incrementedFailedEmailUpdateAttempts(
  emailUpdateId: number,
  executor: Pool | PoolConnection,
  req: Request
): Promise<boolean> {
  try {
    const [resultSetHeader] = await executor.execute<ResultSetHeader>(
      `UPDATE
        email_update
      SET
        failed_update_attempts = failed_update_attempts + 1
      WHERE
        update_id = ?;`,
      [emailUpdateId]
    );

    return resultSetHeader.affectedRows > 0;
  } catch (err: unknown) {
    console.log(err);
    await logUnexpectedError(req, err, 'Failed to increment failed_update_attempts.');

    return false;
  }
}

export async function suspendEmailUpdateRequest(emailUpdateId: number, executor: Pool | PoolConnection, req: Request): Promise<boolean> {
  const newExpiryTimestamp: number = Date.now() + ACCOUNT_UPDATE_SUSPENSION_DURATION;

  try {
    const [resultSetHeader] = await executor.execute<ResultSetHeader>(
      `UPDATE
        email_update
      SET
        failed_update_attempts = ?,
        expiry_timestamp = ?
      WHERE
        update_id = ?;`,
      [ACCOUNT_FAILED_UPDATE_LIMIT, newExpiryTimestamp, emailUpdateId]
    );

    return resultSetHeader.affectedRows > 0;
  } catch (err: unknown) {
    console.log(err);
    await logUnexpectedError(req, err, 'Failed to suspend email_update request.');

    return false;
  }
}

export async function incrementFailedSignInAttempts(accountId: number, executor: Pool | PoolConnection, req: Request): Promise<boolean> {
  try {
    const [resultSetHeader] = await executor.execute<ResultSetHeader>(
      `UPDATE
        accounts
      SET
        failed_sign_in_attempts = failed_sign_in_attempts + 1
      WHERE
        account_id = ?;`,
      [accountId]
    );

    return resultSetHeader.affectedRows > 0;
  } catch (err: unknown) {
    console.log(err);
    await logUnexpectedError(req, err, 'Failed to increment failed_sign_in_attempts.');

    return false;
  }
}

export async function resetFailedSignInAttempts(accountId: number, executor: Pool | PoolConnection, req: Request): Promise<boolean> {
  try {
    const [resultSetHeader] = await executor.execute<ResultSetHeader>(
      `UPDATE
        accounts
      SET
        failed_sign_in_attempts = ?
      WHERE
        account_id = ?;`,
      [0, accountId]
    );

    return resultSetHeader.affectedRows > 0;
  } catch (err: unknown) {
    console.log(err);
    await logUnexpectedError(req, err, 'Failed to reset failed_sign_in_attempts.');

    return false;
  }
}

export async function handleIncorrectPassword(
  accountId: number,
  failedSignInAttempts: number,
  executor: Pool | PoolConnection,
  req: Request,
  res: Response
): Promise<void> {
  const incremented: boolean = await incrementFailedSignInAttempts(accountId, executor, req);
  const hasBeenLocked: boolean = failedSignInAttempts + 1 >= ACCOUNT_FAILED_SIGN_IN_LIMIT && incremented;

  if (hasBeenLocked) {
    removeRequestCookie(res, 'authSessionId');
    await purgeAuthSessions(accountId);
  }

  res.status(401).json({
    message: `Incorrect password.${hasBeenLocked ? ' Account locked.' : ''}`,
    reason: hasBeenLocked ? 'incorrectPassword_locked' : 'incorrectPassword',
  });
}
