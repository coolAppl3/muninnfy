import express, { Router, Request, Response } from 'express';
import { getRequestCookie, removeRequestCookie } from '../util/cookieUtils';
import { generateCryptoUuid, isValidUuid } from '../util/tokenGenerator';
import { undefinedValuesDetected } from '../util/validation/requestValidation';
import { isValidWishlistDescription, isValidWishlistPrivacyLevel, isValidWishlistTitle } from '../util/validation/wishlistValidation';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { getAccountIdByAuthSessionId } from '../db/helpers/authDbHelpers';
import { logUnexpectedError } from '../logs/errorLogger';
import { dbPool } from '../db/db';
import { TOTAL_WISHLISTS_LIMIT } from '../util/constants';
import { generatePlaceHolders } from '../util/sqlUtils/generatePlaceHolders';

export const wishlistsRouter: Router = express.Router();

wishlistsRouter.post('/', async (req: Request, res: Response) => {
  const authSessionId: string | null = getRequestCookie(req, 'authSessionId');

  if (!authSessionId) {
    res.status(401).json({ message: 'Sign in session expired.', reason: 'authSessionExpired' });
    return;
  }

  if (!isValidUuid(authSessionId)) {
    removeRequestCookie(res, 'authSessionId', true);
    res.status(401).json({ message: 'Sign in session expired.', reason: 'authSessionExpired' });

    return;
  }

  interface RequestData {
    privacyLevel: number;
    title: string;
    description: string | null;
  }

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['privacyLevel', 'title', 'description'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  if (!isValidWishlistPrivacyLevel(requestData.privacyLevel)) {
    res.status(400).json({ message: 'Invalid privacy level.', reason: 'invalidPrivacyLevel' });
    return;
  }

  if (!isValidWishlistTitle(requestData.title)) {
    res.status(400).json({ message: 'Invalid title.', reason: 'invalidTitle' });
    return;
  }

  if (!isValidWishlistDescription(requestData.description)) {
    res.status(400).json({ message: 'Invalid description.', reason: 'invalidDescription' });
    return;
  }

  try {
    const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, res);

    if (!accountId) {
      return;
    }

    interface AccountWishlistsDetails extends RowDataPacket {
      wishlists_created_count: number;
    }

    const [accountWishlistsRows] = await dbPool.execute<AccountWishlistsDetails[]>(
      `SELECT
        COUNT(*) AS wishlists_created_count
      FROM
        wishlists
      WHERE
        account_id = ?;`,
      [accountId]
    );

    const accountWishlistsDetails: AccountWishlistsDetails | undefined = accountWishlistsRows[0];

    if (!accountWishlistsDetails) {
      res.status(500).json({ message: 'Internal server error.' });
      return;
    }

    if (accountWishlistsDetails.wishlists_created_count >= TOTAL_WISHLISTS_LIMIT) {
      res.status(403).json({ message: 'Wishlists limit reached.', reason: 'wishlistLimitReached' });
      return;
    }

    const wishlistId: string = generateCryptoUuid();
    const currentTimestamp: number = Date.now();

    await dbPool.execute<ResultSetHeader>(
      `INSERT INTO wishlists (
        wishlist_id,
        account_id,
        privacy_level,
        title,
        description,
        created_on_timestamp
      ) VALUES (${generatePlaceHolders(6)});`,
      [wishlistId, accountId, requestData.privacyLevel, requestData.title, requestData.description, currentTimestamp]
    );

    res.status(201).json({ wishlistId });
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    logUnexpectedError(req, err);
  }
});
