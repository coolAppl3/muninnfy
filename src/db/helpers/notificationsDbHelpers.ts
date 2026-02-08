import { generatePlaceHolders } from '../../util/sqlUtils/generatePlaceHolders';
import { NotificationDetails, NotificationType, sendWebSocketNotification } from '../../webSocket/webSocketHelpers';
import { dbPool } from '../db';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export async function addNotification(
  receiver_account_id: number,
  sender_account_id: number,
  notificationTimestamp: number,
  notificationType: NotificationType
): Promise<void> {
  try {
    const [resultSetHeader] = await dbPool.execute<ResultSetHeader>(
      `INSERT INTO notifications (
        receiver_account_id,
        sender_account_id,
        notification_timestamp,
        notification_type
      ) VALUES (${generatePlaceHolders(4)});`,
      [receiver_account_id, sender_account_id, notificationTimestamp, notificationType]
    );

    type SenderDetails = {
      sender_public_account_id: string;
      sender_username: string;
      sender_display_name: string;
    };

    const [senderRows] = await dbPool.execute<RowDataPacket[]>(
      `SELECT
        public_account_id AS sender_public_account_id,
        username AS sender_username,
        display_name AS sender_display_name
      FROM
        accounts
      WHERE
        account_id = ?;`,
      [sender_account_id]
    );

    const senderDetails = senderRows[0] as SenderDetails | undefined;

    if (!senderDetails) {
      return;
    }

    const notificationDetails: NotificationDetails = {
      notification_id: resultSetHeader.affectedRows,
      ...senderDetails,
      notification_timestamp: notificationTimestamp,
      notification_type: notificationType,
    };

    await sendWebSocketNotification(receiver_account_id, notificationDetails);
  } catch (err: unknown) {
    console.log(err);
  }
}
