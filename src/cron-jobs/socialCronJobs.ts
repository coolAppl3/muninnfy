import { dbPool } from '../db/db';
import { dayMilliseconds } from '../util/constants/globalConstants';

export async function deleteStaleFollowRequestsCron(currentTimestamp: number): Promise<void> {
  const cutoffTimestamp: number = currentTimestamp - dayMilliseconds * 7;

  try {
    await dbPool.execute(
      `DELETE FROM
        follow_requests
      WHERE
        request_timestamp <= ?;`,
      [cutoffTimestamp]
    );
  } catch (err: unknown) {
    console.log(err);
  }
}
