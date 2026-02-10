import { RowDataPacket } from 'mysql2/promise';
import { dbPool } from '../db/db';
import { WebSocketDetails, wsMap } from './webSocketServer';

export type NotificationType = 'NEW_FOLLOWER' | 'NEW_FOLLOW_REQUEST' | 'FOLLOW_REQUEST_ACCEPTED';

export type NotificationDetails = {
  notification_id: number;
  sender_public_account_id: string;
  sender_username: string;
  sender_display_name: string;
  notification_timestamp: number;
  notification_type: NotificationType;
};

export async function sendWebSocketNotification(accountId: number, notificationDetails: NotificationDetails): Promise<void> {
  try {
    type AuthSessionDetails = {
      session_id: string;
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

    for (const { session_id } of authSessionRows as AuthSessionDetails[]) {
      console.log(session_id);

      const wsDetails: WebSocketDetails | undefined = wsMap.get(session_id);

      if (!wsDetails) {
        return;
      }

      wsDetails.ws.send(JSON.stringify(notificationDetails), (err: Error | undefined) => err && console.log(err));
    }
  } catch (err: unknown) {
    console.log(err);
  }
}
