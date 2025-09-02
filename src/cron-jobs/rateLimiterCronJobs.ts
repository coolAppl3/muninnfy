import { dbPool } from '../db/db';
import { hourMilliseconds, minuteMilliseconds } from '../util/constants/globalConstants';
import { REQUESTS_RATE_LIMIT, LIGHT_DAILY_RATE_ABUSE_COUNT } from '../util/constants/rateLimitingConstants';

export async function replenishRateRequestsCron(currentTimestamp: number): Promise<void> {
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

export async function removeStaleRateTrackerRowsCron(currentTimestamp: number): Promise<void> {
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

export async function removeLightRateAbusersCron(currentTimestamp: number): Promise<void> {
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
