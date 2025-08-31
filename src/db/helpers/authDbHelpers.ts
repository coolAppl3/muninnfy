import { Response } from 'express';
import { RowDataPacket } from 'mysql2/promise';
import { dbPool } from '../db';

export async function getAccountIdByAuthSessionId(authSessionId: string, res: Response): Promise<number | null> {
  const currentTimestamp: number = Date.now();

  try {
    interface AuthSessionDetails extends RowDataPacket {
      account_id: number;
      expiry_timestamp: number;
    }

    const [authSessionRows] = await dbPool.execute<AuthSessionDetails[]>(
      `SELECT
        account_id,
        expiry_timestamp
      FROM
        auth_sessions
      WHERE
        session_id = ?;`,
      [authSessionId]
    );

    const authSessionDetails: AuthSessionDetails | undefined = authSessionRows[0];

    if (!authSessionDetails) {
      res.status(401).json({ message: 'Sign in session expired.', reason: 'authSessionExpired' });
      return null;
    }

    if (currentTimestamp >= authSessionDetails.expiry_timestamp) {
      res.status(401).json({ message: 'Sign in session expired.', reason: 'authSessionExpired' });
      return null;
    }

    return authSessionDetails.account_id;
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      return null;
    }

    res.status(500).json({ message: 'Internal server error.' });
    return null;
  }
}
