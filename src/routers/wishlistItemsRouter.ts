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
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { isSqlError } from '../util/sqlUtils/isSqlError';
import { logUnexpectedError } from '../logs/errorLogger';
import { WISHLIST_ITEMS_LIMIT } from '../util/constants/wishlistConstants';
import { sanitizedWishlistItemTags } from '../util/validation/wishlistItemTagValidation';

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
    tags: string[];
  }

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['wishlistId', 'title', 'description', 'link', 'tags'];
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

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, res);

  if (!accountId) {
    return;
  }

  let connection;

  try {
    interface WishlistDetails extends RowDataPacket {
      wishlist_items_count: number;
    }

    const [wishlistRows] = await dbPool.execute<WishlistDetails[]>(
      `SELECT
        (SELECT COUNT(*) FROM wishlist_items WHERE wishlist_id = :wishlistId) AS wishlist_items_count
      FROM
        wishlists
      WHERE
        wishlist_id = :wishlistId AND
        account_id = :accountId;`,
      { wishlistId: requestData.wishlistId, accountId }
    );

    const wishlistDetails: WishlistDetails | undefined = wishlistRows[0];

    if (!wishlistDetails) {
      res.status(404).json({ message: 'Wishlist not found.', reason: 'wishlistNotFound.' });
      return;
    }

    if (wishlistDetails.wishlist_items_count >= WISHLIST_ITEMS_LIMIT) {
      res.status(409).json({ message: 'Wishlist items limit reached.', reason: 'itemLimitReached' });
      return;
    }

    const { wishlistId, title, description, link, tags } = requestData;
    const currentTimestamp: number = Date.now();

    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    const [resultSetHeader] = await connection.execute<ResultSetHeader>(
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
    const sanitizedTags: [number, string][] = sanitizedWishlistItemTags(tags, wishlistItemId);

    await connection.query<ResultSetHeader>(
      `INSERT INTO wishlist_item_tags (
        item_id,
        tag_name
      ) VALUES ?;`,
      [sanitizedTags]
    );

    interface Tag extends RowDataPacket {
      id: number;
      name: string;
    }

    const [itemTags] = await connection.execute<Tag[]>(
      `SELECT
        tag_id AS id,
        tag_name AS name
      FROM
        wishlist_item_tags
      WHERE
        item_id = ?;`,
      [wishlistItemId]
    );

    interface MappedWishlistItem {
      item_id: number;
      added_on_timestamp: number;
      title: string;
      description: string | null;
      link: string | null;
      tags: {
        id: number;
        name: string;
      }[];
    }

    const mappedWishlistItem: MappedWishlistItem = {
      item_id: wishlistItemId,
      added_on_timestamp: currentTimestamp,
      title,
      description,
      link,
      tags: [...itemTags],
    };

    await connection.commit();
    res.status(201).json({ mappedWishlistItem });
  } catch (err: unknown) {
    console.log(err);
    await connection?.rollback();

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
  } finally {
    connection?.release();
  }
});
