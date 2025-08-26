import express, { Request, Response, Router } from 'express';
import { getRequestCookie, removeRequestCookie } from '../util/cookieUtils';
import { isValidUuid } from '../util/tokenGenerator';
import { dbPool } from '../db/db';
import { RowDataPacket } from 'mysql2';
import { destroyAuthSession } from '../auth/authSessions';

export const authRouter: Router = express.Router();

authRouter.get('/session', async (req: Request, res: Response) => {
  console.log(req.cookies.authSessionId);

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
    }

    const [authRows] = await dbPool.execute<AuthSessionDetails[]>(
      `SELECT
        account_id,
        expiry_timestamp
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

    if (authSessionDetails.expiry_timestamp <= Date.now()) {
      removeRequestCookie(res, 'authSessionId', true);
      await destroyAuthSession(authSessionId);

      res.status(401).json({ message: 'Session expired.', reason: 'sessionExpired' });
      return;
    }

    res.json({});
  } catch (err: unknown) {
    console.log(err);
  }
});
