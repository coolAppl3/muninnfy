import express, { Request, Response, Router } from 'express';
import { getRequestCookie, removeRequestCookie } from '../util/cookieUtils';
import { generateCryptoUuid, isValidUuid } from '../util/tokenGenerator';
import { dbPool } from '../db/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { destroyAuthSession } from '../auth/authSessions';
import { dayMilliseconds } from '../util/constants/globalConstants';
import { AUTH_EXTENSIONS_LIMIT } from '../util/constants/authConstants';
import { logUnexpectedError } from '../logs/errorLogger';

export const authRouter: Router = express.Router();

authRouter.get('/session', async (req: Request, res: Response) => {
  const authSessionId: string | null = getRequestCookie(req, 'authSessionId');

  if (!authSessionId) {
    res.json({ isValidAuthSession: false });
    return;
  }

  if (!isValidUuid(authSessionId)) {
    removeRequestCookie(res, 'authSessionId');
    res.json({ isValidAuthSession: false });

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
      removeRequestCookie(res, 'authSessionId');
      res.json({ isValidAuthSession: false });

      return;
    }

    const currentTimestamp: number = Date.now();

    if (authSessionDetails.expiry_timestamp <= currentTimestamp) {
      removeRequestCookie(res, 'authSessionId');
      await destroyAuthSession(authSessionId);

      res.json({ isValidAuthSession: false });
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

    res.json({ isValidAuthSession: true });
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      return;
    }

    res.json({ isValidAuthSession: false });
  }
});

authRouter.delete('/session', async (req: Request, res: Response) => {
  const authSessionId: string | null = getRequestCookie(req, 'authSessionId');

  if (!authSessionId) {
    res.json({});
    return;
  }

  if (!isValidUuid(authSessionId)) {
    removeRequestCookie(res, 'authSessionId');
    res.json({});

    return;
  }

  removeRequestCookie(res, 'authSessionId');
  res.json({});

  try {
    const [resultSetHeader] = await dbPool.execute<ResultSetHeader>(
      `DELETE FROM
        auth_sessions
      WHERE
        session_id = ?;`,
      [authSessionId]
    );

    if (resultSetHeader.affectedRows === 0) {
      await logUnexpectedError(req, null, 'failed to delete auth_sessions');
    }
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
  }
});
