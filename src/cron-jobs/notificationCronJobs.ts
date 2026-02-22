import { dbPool } from '../db/db';
import { dayMilliseconds } from '../util/constants/globalConstants';

export async function deleteStaleNotificationsCron(currentTimestamp: number): Promise<void> {
  const cutoffTimestamp: number = currentTimestamp - dayMilliseconds * 30;

  try {
    await dbPool.execute(
      `DELETE FROM
        notifications
      WHERE
        notification_timestamp <= ?;`,
      [cutoffTimestamp]
    );
  } catch (err: unknown) {
    console.log(err);
  }
}
