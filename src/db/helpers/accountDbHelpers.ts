import { Request, Response } from 'express';
import { Pool, PoolConnection, ResultSetHeader } from 'mysql2/promise';
import { logUnexpectedError } from '../../logs/errorLogger';
import {
  ACCOUNT_UPDATE_SUSPENSION_DURATION,
  ACCOUNT_FAILED_SIGN_IN_LIMIT,
  ACCOUNT_FAILED_ATTEMPTS_LIMIT,
} from '../../util/constants/accountConstants';
import { removeRequestCookie } from '../../util/cookieUtils';
import { purgeAuthSessions } from '../../auth/authSessions';

export async function incrementAccountRequestEmailsSent(
  tableName: 'account_verification' | 'account_recovery' | 'account_deletion' | 'email_update',
  requestId: number,
  executor: Pool | PoolConnection,
  req: Request
): Promise<boolean> {
  try {
    const [resultSetHeader] = await executor.execute<ResultSetHeader>(
      `UPDATE
        ${tableName}
      SET
        emails_sent = emails_sent + 1
      WHERE
        request_id = ?;`,
      [requestId]
    );

    return resultSetHeader.affectedRows > 0;
  } catch (err: unknown) {
    console.log(err);
    await logUnexpectedError(req, err, `Failed to increment emails_sent for ${tableName}.`);

    return false;
  }
}

export async function incrementFailedAccountRequestAttempts(
  tableName: 'account_verification' | 'account_recovery' | 'account_deletion' | 'email_update',
  requestId: number,
  executor: Pool | PoolConnection,
  req: Request
): Promise<boolean> {
  try {
    const [resultSetHeader] = await executor.execute<ResultSetHeader>(
      `UPDATE
        ${tableName}
      SET
        failed_attempts = failed_attempts + 1
      WHERE
        request_id = ?;`,
      [requestId]
    );

    return resultSetHeader.affectedRows > 0;
  } catch (err: unknown) {
    console.log(err);
    await logUnexpectedError(req, err, `Failed to increment failed_attempts for ${tableName}.`);

    return false;
  }
}

export async function suspendAccountRequest(
  tableName: 'account_recovery' | 'account_deletion' | 'email_update',
  requestId: number,
  executor: Pool | PoolConnection,
  req: Request
): Promise<boolean> {
  const newExpiryTimestamp: number = Date.now() + ACCOUNT_UPDATE_SUSPENSION_DURATION;

  try {
    const [resultSetHeader] = await executor.execute<ResultSetHeader>(
      `UPDATE
        ${tableName}
      SET
        failed_attempts = ?,
        expiry_timestamp = ?
      WHERE
        request_id = ?;`,
      [ACCOUNT_FAILED_ATTEMPTS_LIMIT, newExpiryTimestamp, requestId]
    );

    return resultSetHeader.affectedRows > 0;
  } catch (err: unknown) {
    console.log(err);
    await logUnexpectedError(req, err, `Failed to suspend ${tableName} request.`);

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

async function incrementFailedSignInAttempts(accountId: number, executor: Pool | PoolConnection, req: Request): Promise<boolean> {
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
