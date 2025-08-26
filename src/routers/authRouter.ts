import express, { Request, Response, Router } from 'express';
import { getRequestCookie, removeRequestCookie } from '../util/cookieUtils';
import { generateCryptoUuid, isValidUuid } from '../util/tokenGenerator';
import { dbPool } from '../db/db';
import { RowDataPacket } from 'mysql2';
import { destroyAuthSession } from '../auth/authSessions';
import { AUTH_EXTENSIONS_LIMIT, dayMilliseconds } from '../util/constants';

export const authRouter: Router = express.Router();

authRouter.get('/session', async (req: Request, res: Response) => {
  const authSessionId: string | null = getRequestCookie(req, 'authSessionId');

  if (!authSessionId) {
    res.status(401).json({ message: 'Not signed in.', reason: 'notSignedIn' });
    return;
  }

  if (!isValidUuid(authSessionId)) {
    removeRequestCookie(res, 'authSessionId', true);
    res.status(401).json({ message: 'Not signed in.', reason: 'notSignedIn' });

    return;
  }

  try {
    interface AuthSessionDetails extends RowDataPacket {
      account_id: number;
      expiry_timestamp: number;
      keep_signed_in: boolean;
      extensions_count: number;
    }

    const [authRows] = await dbPool.execute<AuthSessionDetails[]>(
      `SELECT
        account_id,
        expiry_timestamp,
        keep_signed_in,
        extensions_count
      FROM
        auth_sessions
      WHERE
        session_id = ?;`,
      [authSessionId]
    );

    const authSessionDetails: AuthSessionDetails | undefined = authRows[0];

    if (!authSessionDetails) {
      removeRequestCookie(res, 'authSessionId', true);
      res.status(404).json({ message: 'Session not found.', reason: 'sessionNotFound' });

      return;
    }

    const currentTimestamp: number = Date.now();

    if (authSessionDetails.expiry_timestamp <= currentTimestamp) {
      removeRequestCookie(res, 'authSessionId', true);
      await destroyAuthSession(authSessionId);

      res.status(401).json({ message: 'Session expired.', reason: 'sessionExpired' });
      return;
    }

    const timeTillExpiry: number = authSessionDetails.expiry_timestamp - currentTimestamp;
    if (
      timeTillExpiry < dayMilliseconds &&
      authSessionDetails.keep_signed_in &&
      authSessionDetails.extensions_count < AUTH_EXTENSIONS_LIMIT
    ) {
      const newAuthSessionId: string = generateCryptoUuid();
      const newExpiryTimestamp: number = authSessionDetails.expiry_timestamp + dayMilliseconds;

      await dbPool.execute(
        `UPDATE
          auth_sessions
        SET
          session_id = ?,
          expiry_timestamp = ?,
          extensions_count = extensions_count + 1
        WHERE
          session_id = ?;`,
        [newAuthSessionId, newExpiryTimestamp, authSessionId]
      );
    }

    res.json({});
  } catch (err: unknown) {
    console.log(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});
