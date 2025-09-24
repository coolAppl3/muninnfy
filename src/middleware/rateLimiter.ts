import { NextFunction, Request, Response } from 'express';
import { getRequestCookie, setResponseCookie } from '../util/cookieUtils';
import { dbPool } from '../db/db';
import { generatePlaceHolders } from '../util/sqlUtils/generatePlaceHolders';
import { RowDataPacket } from 'mysql2/promise';
import { hourMilliseconds } from '../util/constants/globalConstants';
import { ABUSE_INCREMENT_THRESHOLD, REQUESTS_RATE_LIMIT } from '../util/constants/rateLimitingConstants';
import { generateCryptoUuid, isValidUuid } from '../util/tokenGenerator';

export async function rateLimiter(req: Request, res: Response, next: NextFunction): Promise<void> {
  const rateLimitId: string | null = getRequestCookie(req, 'rateLimitId');

  if (!rateLimitId || !isValidUuid(rateLimitId)) {
    await addToRateTracker(res);
    next();

    return;
  }

  await incrementRequestsCount(rateLimitId);

  if (await rateLimitReached(rateLimitId, req, res)) {
    res.status(429).json({ message: 'Too many requests.' });
    return;
  }

  next();
}

async function addToRateTracker(res: Response): Promise<void> {
  const newRateId: string = generateCryptoUuid();
  const currentTimestamp: number = Date.now();

  try {
    await dbPool.execute(
      `INSERT INTO rate_tracker (
        rate_limit_id,
        requests_count,
        window_timestamp
      ) VALUES (${generatePlaceHolders(3)});`,
      [newRateId, 1, currentTimestamp]
    );

    setResponseCookie(res, 'rateLimitId', newRateId, hourMilliseconds, true);
  } catch (err: unknown) {
    console.log('RATE LIMITING ERROR:', err);
  }
}

async function rateLimitReached(rateLimitId: string, req: Request, res: Response): Promise<boolean> {
  type RateTrackerDetails = {
    requests_count: number;
  };

  try {
    const [rateTrackerRows] = await dbPool.execute<RowDataPacket[]>(
      `SELECT
        requests_count
      FROM
        rate_tracker
      WHERE
        rate_limit_id = ?;`,
      [rateLimitId]
    );

    const rateTrackerDetails = rateTrackerRows[0] as RateTrackerDetails | undefined;

    if (!rateTrackerDetails) {
      await addToRateTracker(res);
      return false;
    }

    if (rateTrackerDetails.requests_count > REQUESTS_RATE_LIMIT) {
      rateTrackerDetails.requests_count > ABUSE_INCREMENT_THRESHOLD && (await addToAbusiveUsers(req));
      return true;
    }

    return false;
  } catch (err: unknown) {
    console.log(err);
    return false;
  }
}

async function incrementRequestsCount(rateLimitId: string): Promise<void> {
  try {
    await dbPool.execute(
      `UPDATE
        rate_tracker
      SET
        requests_count = requests_count + 1
      WHERE
        rate_limit_id = ?;`,
      [rateLimitId]
    );
  } catch (err: unknown) {
    console.log(err);
  }
}

async function addToAbusiveUsers(req: Request): Promise<void> {
  const currentTimestamp: number = Date.now();

  if (!req.ip) {
    return;
  }

  try {
    type UserDetails = {
      rate_limit_reached_count: number;
      latest_abuse_timestamp: number;
    };

    const [userRows] = await dbPool.execute<RowDataPacket[]>(
      `SELECT
        rate_limit_reached_count
      FROM
        abusive_users
      WHERE
        ip_address = ?;`,
      [req.ip]
    );

    const userDetails = userRows[0] as UserDetails | undefined;

    if (!userDetails) {
      await dbPool.execute(
        `INSERT INTO abusive_users (
          ip_address,
          first_abuse_timestamp,
          latest_abuse_timestamp,
          rate_limit_reached_count
        ) VALUES (${generatePlaceHolders(4)});`,
        [req.ip, currentTimestamp, currentTimestamp, 1]
      );

      return;
    }

    await dbPool.execute(
      `UPDATE
        abusive_users
      SET
        rate_limit_reached_count = ?,
        latest_abuse_timestamp = ?
      WHERE
        ip_address = ?;`,
      [userDetails.rate_limit_reached_count + 1, currentTimestamp, req.ip]
    );
  } catch (err: unknown) {
    console.log(err);
  }
}
