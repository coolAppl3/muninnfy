import express, { Router, Request, Response } from 'express';
import { getRequestCookie, removeRequestCookie } from '../util/cookieUtils';
import { isValidUuid } from '../util/tokenGenerator';
import { undefinedValuesDetected } from '../util/validation/requestValidation';
import { isValidWishlistItemTagName } from '../util/validation/wishlistItemTagValidation';
import { getAccountIdByAuthSessionId } from '../db/helpers/authDbHelpers';
import { dbPool } from '../db/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { generatePlaceHolders } from '../util/sqlUtils/generatePlaceHolders';
import { isSqlError } from '../util/sqlUtils/isSqlError';
import { logUnexpectedError } from '../logs/errorLogger';
import { WISHLIST_ITEM_TAGS_LIMIT } from '../util/constants/wishlistItemConstants';

export const wishlistItemTagsRouter: Router = express.Router();

wishlistItemTagsRouter.post('/', async (req: Request, res: Response) => {
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
    itemId: number;
    tagName: string;
  }

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['itemId', 'tagName'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  if (!Number.isInteger(requestData.itemId)) {
    res.status(400).json({ message: 'Invalid item Id.', reason: 'invalidItemId' });
    return;
  }

  if (!isValidWishlistItemTagName(requestData.tagName)) {
    res.status(400).json({ message: 'Invalid tag name.', reason: 'invalidTagName' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, res);

  if (!accountId) {
    return;
  }

  try {
    interface WishlistDetails extends RowDataPacket {
      wishlist_item_tags_count: number;
    }

    const [wishlistRows] = await dbPool.execute<WishlistDetails[]>(
      `SELECT
        (SELECT COUNT(*) FROM wishlist_item_tags WHERE item_id = ?) AS wishlist_item_tags_count
      FROM
        wishlists
      WHERE
        wishlist_id = ? AND
        account_id = ?;`,
      [requestData.itemId, requestData.wishlistId, accountId]
    );

    const wishlistDetails: WishlistDetails | undefined = wishlistRows[0];

    if (!wishlistDetails) {
      res.status(404).json({ message: 'Wishlist not found.', reason: 'wishlistNotFound' });
      return;
    }

    if (wishlistDetails.wishlist_item_tags_count >= WISHLIST_ITEM_TAGS_LIMIT) {
      res.status(409).json({ message: 'Wishlist item tags limit reached.', reason: 'itemTagsLimitReached' });
      return;
    }

    const [resultSetHeader] = await dbPool.execute<ResultSetHeader>(
      `INSERT INTO wishlist_item_tags (
        item_id,
        tag_name
      ) VALUES (${generatePlaceHolders(2)});`,
      [requestData.itemId, requestData.tagName]
    );

    res.status(201).json({ tagId: resultSetHeader.insertId });
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

    if (sqlError.errno === 1452 && sqlError.code === 'ER_NO_REFERENCED_ROW_2') {
      res.status(404).json({ message: 'Wishlist item not found.', reason: 'itemNotFound' });
      return;
    }

    if (sqlError.errno === 1062 && sqlError.sqlMessage?.endsWith(`for key 'item_id'`)) {
      res.status(409).json({ message: 'Item already contains this tag.', reason: 'duplicateItemTag' });
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  }
});
