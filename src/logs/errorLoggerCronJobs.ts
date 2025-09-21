import { dbPool } from '../db/db';
import { dayMilliseconds } from '../util/constants/globalConstants';

export async function clearErrorLogsCron(currentTimestamp: number): Promise<void> {
  try {
    await dbPool.execute(
      `DELETE FROM
        unexpected_errors
      WHERE
        ? - error_timestamp >= ?;`,
      [currentTimestamp, 7 * dayMilliseconds]
    );
  } catch (err: unknown) {
    console.log(err);
  }
}
