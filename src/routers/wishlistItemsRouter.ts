import express, { Router, Request, Response } from 'express';
import { isValidUuid } from '../util/tokenGenerator';
import { getRequestCookie, removeRequestCookie } from '../util/cookieUtils';
import { undefinedValuesDetected } from '../util/validation/requestValidation';
import {
  isValidWishlistItemDescription,
  isValidWishlistItemLink,
  isValidWishlistItemTitle,
} from '../util/validation/wishlistItemValidation';
import { getAccountIdByAuthSessionId } from '../db/helpers/authDbHelpers';
import { dbPool } from '../db/db';
import { generatePlaceHolders } from '../util/sqlUtils/generatePlaceHolders';
import { ResultSetHeader } from 'mysql2/promise';
import { isSqlError } from '../util/sqlUtils/isSqlError';
import { logUnexpectedError } from '../logs/errorLogger';

export const wishlistItemsRouter: Router = express.Router();

wishlistItemsRouter.post('/', async (req: Request, res: Response) => {
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
    wishlistId: string;
    title: string;
    description: string | null;
    link: string | null;
  }

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['wishlistId', 'title', 'description', 'link'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  if (!isValidUuid(requestData.wishlistId)) {
    res.status(400).json({ message: 'Invalid wishlist ID.', reason: 'invalidWishlistId' });
    return;
  }

  if (!isValidWishlistItemTitle(requestData.title)) {
    res.status(400).json({ message: 'Invalid title.', reason: 'invalidTitle' });
    return;
  }

  if (requestData.description && !isValidWishlistItemDescription(requestData.description)) {
    res.status(400).json({ message: 'Invalid description.', reason: 'invalidDescription' });
    return;
  }

  if (requestData.link && !isValidWishlistItemLink(requestData.link)) {
    res.status(400).json({ message: 'Invalid link.', reason: 'invalidLink' });
    return;
  }

  try {
    const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, res);

    if (!accountId) {
      return;
    }

    const { wishlistId, title, description, link } = requestData;
    const currentTimestamp: number = Date.now();

    const [resultSetHeader] = await dbPool.execute<ResultSetHeader>(
      `INSERT INTO wishlist_items (
        wishlist_id,
        added_on_timestamp,
        title,
        description,
        link,
        is_purchased
      ) VALUES (${generatePlaceHolders(6)});`,
      [wishlistId, currentTimestamp, title, description, link, false]
    );

    const wishlistItemId: number = resultSetHeader.insertId;
    res.json({ wishlistItemId });
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      return;
    }

    if (!isSqlError(err)) {
      res.status(500).json({ message: 'Internal server error.' });
      await logUnexpectedError(req, err);

      return;
    }

    const sqlError: SqlError = err;

    if (sqlError.errno === 1062 && sqlError.sqlMessage?.endsWith(`for key 'title'`)) {
      res.status(409).json({ message: 'Wishlist already contains this item.', reason: 'duplicateItemTitle' });
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  }
});
