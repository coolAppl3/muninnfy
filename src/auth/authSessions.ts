import { Response } from 'express';
import { dbPool } from '../db/db';
import { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { setResponseCookie } from '../util/cookieUtils';
import { dayMilliseconds, hourMilliseconds } from '../util/constants/globalConstants';
import { AUTH_SESSIONS_LIMIT } from '../util/constants/authConstants';
import { generatePlaceHolders } from '../util/sqlUtils/generatePlaceHolders';
import { isSqlError } from '../util/sqlUtils/isSqlError';
import { generateCryptoUuid } from '../util/tokenGenerator';

export async function createAuthSession(
  res: Response,
  accountId: number,
  keepSignedIn: boolean,
  attemptCount: number = 1
): Promise<boolean> {
  if (attemptCount > 3) {
    return false;
  }

  const newAuthSessionId: string = generateCryptoUuid();
  const currentTimestamp: number = Date.now();

  const maxAge: number | undefined = keepSignedIn ? dayMilliseconds * 7 : undefined;
  const expiryTimestamp: number = currentTimestamp + (maxAge ? maxAge : hourMilliseconds * 6);

  let connection: PoolConnection | null = null;

  try {
    connection = await dbPool.getConnection();
    await connection.execute(`SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;`);
    await connection.beginTransaction();

    type SessionDetails = {
      session_id: string;
      created_on_timestamp: number;
    };

    const [sessionRows] = await connection.execute<RowDataPacket[]>(
      `SELECT
        session_id,
        created_on_timestamp
      FROM
        auth_sessions
      WHERE
        account_id = ?
      LIMIT
        ${AUTH_SESSIONS_LIMIT}
      FOR UPDATE;`,
      [accountId]
    );

    if (sessionRows.length < 3) {
      await connection.execute(
        `INSERT INTO auth_sessions (
          session_id,
          account_id,
          created_on_timestamp,
          expiry_timestamp,
          keep_signed_in,
          extensions_count
        ) VALUES (${generatePlaceHolders(6)});`,
        [newAuthSessionId, accountId, currentTimestamp, expiryTimestamp, keepSignedIn, 0]
      );

      await connection.commit();

      setResponseCookie(res, 'authSessionId', newAuthSessionId, maxAge, true);
      return true;
    }

    const oldestAuthSession = (sessionRows as SessionDetails[]).reduce((oldest: SessionDetails | null, current: SessionDetails) => {
      if (!oldest) {
        return current;
      }

      if (current.created_on_timestamp < oldest.created_on_timestamp) {
        return current;
      }

      return oldest;
    }, null);

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
      return await createAuthSession(res, accountId, keepSignedIn, ++attemptCount);
    }

    return false;
  } finally {
    connection?.release();
  }
}

export async function destroyAuthSession(authSessionId: string): Promise<void> {
  try {
    await dbPool.execute(
      `DELETE FROM
        auth_sessions
      WHERE
        session_id = ?;`,
      [authSessionId]
    );
  } catch (err: unknown) {
    console.log(err);
  }
}

export async function purgeAuthSessions(accountId: number, authSessionIdToExclude?: string): Promise<void> {
  try {
    await dbPool.execute(
      `DELETE FROM
        auth_sessions
      WHERE
        account_id = ? ${authSessionIdToExclude ? `AND session_id != ${authSessionIdToExclude}` : ''}
      LIMIT ${AUTH_SESSIONS_LIMIT};`,
      [accountId]
    );
  } catch (err: unknown) {
    console.log(err);
  }
}

export async function deleteExpiredAuthSessionsCron(currentTimestamp: number): Promise<void> {
  try {
    await dbPool.execute(
      `DELETE FROM
        auth_sessions
      WHERE
        expiry_timestamp <= ?;`,
      [currentTimestamp]
    );
  } catch (err: unknown) {
    console.log(err);
  }
}
