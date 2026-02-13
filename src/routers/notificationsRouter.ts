import express, { Router, Request, Response } from 'express';
import { dbPool } from '../db/db';
import { RowDataPacket } from 'mysql2/promise';
import { getAuthSessionId } from '../auth/authUtils';
import { getAccountIdByAuthSessionId } from '../db/helpers/authDbHelpers';
import { logUnexpectedError } from '../logs/errorLogger';
import { NOTIFICATIONS_FETCH_BATCH_SIZE } from '../util/constants/notificationsConstants';
import { NotificationDetails } from '../webSocket/webSocketHelpers';

export const notificationsRouter: Router = express.Router();

notificationsRouter.get('/:offset', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  const offset: number = +(req.params.offset || 0);

  if (!Number.isInteger(offset)) {
    res.status(400).json({ message: 'Invalid offset.', reason: 'invalidOffset' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

  if (!accountId) {
    return;
  }

  try {
    const [notifications] = await dbPool.execute<RowDataPacket[]>(
      `SELECT
        notifications.notification_id,
        notifications.notification_timestamp,
        notifications.notification_type,
        
        accounts.public_account_id AS sender_public_account_id,
        accounts.username AS sender_username,
        accounts.display_name AS sender_display_name
      FROM
        notifications
      LEFT JOIN
        accounts ON notifications.sender_account_id = accounts.account_id
      WHERE
        notifications.receiver_account_id = ?
      ORDER BY
        notifications.notification_timestamp DESC,
        notifications.notification_id DESC
      LIMIT ?
      OFFSET ?;`,
      [accountId, NOTIFICATIONS_FETCH_BATCH_SIZE, offset]
    );

    res.json(notifications as NotificationDetails[]);
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  }
});
