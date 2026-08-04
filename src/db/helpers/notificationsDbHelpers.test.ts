import { describe, expect, it, vi } from 'vitest';
import { dbPool } from '../db';
import { generatePlaceHolders } from '../../util/sqlUtils/generatePlaceHolders';
import { addNotification } from './notificationsDbHelpers';
import * as webSocketHelpers from '../../webSocket/webSocketHelpers';

vi.mock('../../webSocket/webSocketHelpers');

describe('addNotification', () => {
  it('should insert the notification into the notifications table, fetch the sender details, create a notification object, and send by calling sendWebSocketNotification', async () => {
    const senderDetails = {
      sender_public_account_id: '818db302-cec8-4fe1-84df-01e2aa505cb6',
      sender_username: 'johnDoe',
      sender_display_name: 'John Doe',
    };

    vi.mocked(dbPool.execute).mockResolvedValueOnce([{ insertId: 1 } as any, []]);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          ...senderDetails,
        } as any,
      ],
      [],
    ]);
    vi.mocked(webSocketHelpers.sendWebSocketNotification).mockResolvedValueOnce();

    await addNotification(2, 1, 1.772e12, 'new_follower', 1);

    expect(dbPool.execute).toHaveBeenCalledTimes(2);
    expect(dbPool.execute).toHaveBeenCalledWith(
      `INSERT INTO notifications (
        receiver_account_id,
        sender_account_id,
        notification_timestamp,
        notification_type
      ) VALUES (${generatePlaceHolders(4)});`,
      [2, 1, 1.772e12, 'new_follower']
    );
    expect(dbPool.execute).toHaveBeenCalledWith(
      `SELECT
        public_account_id AS sender_public_account_id,
        username AS sender_username,
        display_name AS sender_display_name
      FROM
        accounts
      WHERE
        account_id = ?;`,
      [1]
    );
    expect(webSocketHelpers.sendWebSocketNotification).toHaveBeenCalledExactlyOnceWith(2, {
      notification_id: 1,
      ...senderDetails,
      notification_timestamp: 1.772e12,
      notification_type: 'new_follower',
      notification_data: {
        follow_id: 1,
        follow_timestamp: 1.772e12,
        public_account_id: senderDetails.sender_public_account_id,
        username: senderDetails.sender_username,
        display_name: senderDetails.sender_display_name,
      },
    });
  });
});
