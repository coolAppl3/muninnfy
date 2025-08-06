import { Response } from 'express';
import { dbPool } from '../db/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { setResponseCookie } from '../util/cookieUtils';
import { AUTH_SESSIONS_LIMIT, hourMilliseconds } from '../util/constants';
import { generatePlaceHolders } from '../util/sqlUtils/generatePlaceHolders';
import { isSqlError } from '../util/sqlUtils/isSqlError';
import { generateCryptoUuid } from '../util/tokenGenerator';

interface CreateAuthSessionConfig {
  user_id: number;
  keepSignedIn: boolean;
}

export async function createAuthSession(res: Response, sessionConfig: CreateAuthSessionConfig, attemptCount: number = 1): Promise<boolean> {
  if (attemptCount > 3) {
    return false;
  }

  const newAuthSessionId: string = generateCryptoUuid();
  const currentTimestamp: number = Date.now();

  const maxAge: number = sessionConfig.keepSignedIn ? hourMilliseconds * 24 * 7 : hourMilliseconds * 6;
  const expiryTimestamp: number = currentTimestamp + maxAge;

  let connection;

  try {
    connection = await dbPool.getConnection();
    await connection.execute(`SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;`);
    await connection.beginTransaction();

    interface SessionDetails extends RowDataPacket {
      session_id: string;
      created_on_timestamp: number;
    }

    const [sessionRows] = await connection.execute<SessionDetails[]>(
      `SELECT
        session_id,
        created_on_timestamp
      FROM
        auth_sessions
      WHERE
        user_id = ?
      LIMIT ${AUTH_SESSIONS_LIMIT};`,
      [sessionConfig.user_id]
    );

    if (sessionRows.length < 3) {
      await connection.execute(
        `INSERT INTO auth_sessions (
          session_id,
          user_id,
          created_on_timestamp,
          expiry_timestamp
        ) VALUES (${generatePlaceHolders(4)});`,
        [newAuthSessionId, sessionConfig.user_id, currentTimestamp, expiryTimestamp]
      );

      await connection.commit();

      setResponseCookie(res, 'authSessionId', newAuthSessionId, maxAge, true);
      return true;
    }

    const oldestAuthSession: SessionDetails | undefined = sessionRows.sort((a, b) => a.created_on_timestamp - b.created_on_timestamp)[0];

    if (!oldestAuthSession) {
      await connection.rollback();
      return false;
    }

    const [resultSetHeader] = await connection.execute<ResultSetHeader>(
      `UPDATE
        auth_sessions
      SET
        session_id = ?,
        created_on_timestamp = ?,
        expiry_timestamp = ?
      WHERE
        session_id = ?;`,
      [newAuthSessionId, currentTimestamp, expiryTimestamp, oldestAuthSession.session_id]
    );

    if (resultSetHeader.affectedRows === 0) {
      await connection.rollback();
      return false;
    }

    await connection.commit();

    setResponseCookie(res, 'authSessionId', newAuthSessionId, maxAge, true);
    return true;
  } catch (err: unknown) {
    console.log(err);
    await connection?.rollback();

    if (!isSqlError(err)) {
      return false;
    }

    if (err.errno === 1062 && err.sqlMessage?.endsWith(`for key 'PRIMARY'`)) {
      return await createAuthSession(res, sessionConfig, ++attemptCount);
    }

    return false;
  } finally {
    connection?.release();
  }
}

export async function destroyAuthSession(sessionId: string): Promise<void> {
  try {
    await dbPool.execute(
      `DELETE FROM
        auth_sessions
      WHERE
        session_id = ?;`,
      [sessionId]
    );
  } catch (err: unknown) {
    console.log(err);
  }
}

export async function purgeAuthSessions(userId: number, userType: 'account' | 'guest'): Promise<void> {
  try {
    await dbPool.execute(
      `DELETE FROM
        auth_sessions
      WHERE
        user_id = ?
      LIMIT ${AUTH_SESSIONS_LIMIT};`,
      [userId]
    );
  } catch (err: unknown) {
    console.log(err);
  }
}
