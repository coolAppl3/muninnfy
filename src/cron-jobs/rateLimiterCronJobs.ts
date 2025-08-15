import { dbPool } from '../db/db';
import { REQUESTS_RATE_LIMIT, hourMilliseconds, LIGHT_DAILY_RATE_ABUSE_COUNT, minuteMilliseconds } from '../util/constants';

export async function replenishRateRequests(currentTimestamp: number): Promise<void> {
  const requestsToReplenish: number = REQUESTS_RATE_LIMIT / 2;

  try {
    await dbPool.execute(
      `UPDATE
        rate_tracker
      SET
        requests_count = GREATEST(requests_count - ?, 0)
      WHERE
        ? - window_timestamp >= ?;`,
      [requestsToReplenish, currentTimestamp, minuteMilliseconds / 2]
    );
  } catch (err: unknown) {
    console.log(err);
  }
}

export async function removeStaleRateTrackerRows(): Promise<void> {
  const currentTimestamp: number = Date.now();

  try {
    await dbPool.execute(
      `DELETE FROM
        rate_tracker
      WHERE
        ? - window_timestamp >= ? AND
        requests_count = ?;`,
      [currentTimestamp, minuteMilliseconds, 0]
    );
  } catch (err: unknown) {
    console.log(err);
  }
}

export async function removeLightRateAbusers(currentTimestamp: number): Promise<void> {
  try {
    await dbPool.execute(
      `DELETE FROM
        abusive_users
      WHERE
        rate_limit_reached_count <= ? AND
        ? - latest_abuse_timestamp >= ?;`,
      [LIGHT_DAILY_RATE_ABUSE_COUNT, currentTimestamp, hourMilliseconds]
    );
  } catch (err: unknown) {
    console.log(err);
  }
}
