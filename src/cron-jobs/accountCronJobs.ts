import { dbPool } from '../db/db';
import { minuteMilliseconds } from '../util/constants';

export async function deleteUnverifiedAccountsCron(currentTimestamp: number): Promise<void> {
  try {
    await dbPool.execute(
      `DELETE FROM
        accounts
      WHERE
        is_verified = ? AND
        ? - created_on_timestamp >= ?;`,
      [false, currentTimestamp, 20 * minuteMilliseconds]
    );
  } catch (err: unknown) {
    console.log(err);
  }
}
