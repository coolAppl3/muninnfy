import { Request, Response } from 'express';
import { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { logUnexpectedError } from '../../logs/errorLogger';
import { removeRequestCookie } from '../../util/cookieUtils';
import { isValidUuid } from '../../util/tokenGenerator';
import { dbPool } from '../db';

export async function deleteFollowRequest(
  requestId: number,
  executor: Pool | PoolConnection,
  req: Request
): Promise<boolean> {
  try {
    const [resultSetHeader] = await executor.execute<ResultSetHeader>(
      `DELETE FROM
        follow_requests
      WHERE
        request_id = ?;`,
      [requestId]
    );

    return resultSetHeader.affectedRows > 0;
  } catch (err: unknown) {
    console.log(err);
    await logUnexpectedError(req, err, 'Failed to delete follow request.');

    return false;
  }
}

export async function getTargetAccountId(
  accountId: number | null,
  req: Request,
  res: Response
): Promise<number | null> {
  const publicAccountId = req.query.publicAccountId;

  if (!publicAccountId) {
    if (accountId) {
      return accountId; // not a view request
    }

    removeRequestCookie(res, 'authSessionId');
    res.status(401).json({ message: 'Sign in session expired.', reason: 'authSessionExpired' });

    return null;
  }

  if (typeof publicAccountId !== 'string' || !isValidUuid(publicAccountId)) {
    res.status(404).json({ message: 'Account not found.', reason: 'accountNotFound' });
    return null;
  }

  type AccountDetails = {
    target_account_id: number;
    is_private: boolean;
    is_following: boolean;
  };

  const [accountRows] = await dbPool.execute<RowDataPacket[]>(
    `SELECT
      accounts.account_id AS target_account_id,
      account_preferences.is_private,
      
      EXISTS (SELECT 1 FROM followers WHERE account_id = accounts.account_id AND follower_account_id = ?) AS is_following
    FROM
      accounts
    INNER JOIN
      account_preferences USING(account_id)
    WHERE
      accounts.public_account_id = ?;`,
    [accountId || 0, publicAccountId]
  );

  const accountDetails = accountRows[0] as AccountDetails | undefined;

  if (!accountDetails) {
    res.status(404).json({ message: 'Account not found.', reason: 'accountNotFound' });
    return null;
  }

  if (accountDetails.is_private && !accountDetails.is_following) {
    res.status(401).json({ message: 'Account is private.', reason: 'privateAccount' });
    return null;
  }

  return accountDetails.target_account_id;
}
