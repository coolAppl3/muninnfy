import { RowDataPacket } from 'mysql2/promise';
import { dbPool } from '../db/db';
import { WebSocketDetails, wsMap } from './webSocketServer';

type WebSocketMessage = {
  type: string;
  reason: string;
  data: { [key: string]: unknown };
};

export async function sendWebSocketMessage(accountId: number, data: WebSocketMessage): Promise<void> {
  try {
    type AuthSessionDetails = {
      authSessionId: string;
    };

    const [authSessionRows] = await dbPool.execute<RowDataPacket[]>(
      `SELECT
        session_id
      FROM
        auth_sessions
      WHERE
        account_id = ?;`,
      [accountId]
    );

    for (const { authSessionId } of authSessionRows as AuthSessionDetails[]) {
      const wsDetails: WebSocketDetails | undefined = wsMap.get(authSessionId);

      if (!wsDetails) {
        return;
      }

      wsDetails.ws.send(JSON.stringify(data), (err: Error | undefined) => err && console.log(err));
    }
  } catch (err: unknown) {
    console.log(err);
  }
}
