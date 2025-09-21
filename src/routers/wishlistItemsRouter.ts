import express, { Router, Request, Response } from 'express';
import { isValidUuid } from '../util/tokenGenerator';
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
import { sanitizeWishlistItemTags } from '../util/validation/wishlistItemTagValidation';
import { deleteWishlistItemTags, insertWishlistItemTags } from '../db/helpers/wishlistItemTagsDbHelpers';
import { getWishlistItemByTitle } from '../db/helpers/wishlistItemsDbHelpers';
import { getAuthSessionId } from '../auth/authUtils';

export const wishlistItemsRouter: Router = express.Router();

export interface MappedWishlistItem {
  item_id: number;
  added_on_timestamp: number;
  title: string;
  description: string | null;
  link: string | null;
  is_purchased: boolean;
  tags: {
    id: number;
    name: string;
  }[];
}

wishlistItemsRouter.post('/', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
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

  const { wishlistId, title, description, link, tags } = requestData;

  if (!isValidUuid(wishlistId)) {
    res.status(400).json({ message: 'Invalid wishlist ID.', reason: 'invalidWishlistId' });
    return;
  }

  if (!isValidWishlistItemTitle(title)) {
    res.status(400).json({ message: 'Invalid title.', reason: 'invalidTitle' });
    return;
  }

  if (description && !isValidWishlistItemDescription(description)) {
    res.status(400).json({ message: 'Invalid description.', reason: 'invalidDescription' });
    return;
  }

  if (link && !isValidWishlistItemLink(link)) {
    res.status(400).json({ message: 'Invalid link.', reason: 'invalidLink' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, res);

  if (!accountId) {
    return;
  }

  let connection;

  try {
    interface WishlistDetails {
      wishlist_items_count: number;
    }

    const [wishlistRows] = await dbPool.execute<RowDataPacket[]>(
      `SELECT
        (SELECT COUNT(*) FROM wishlist_items WHERE wishlist_id = :wishlistId) AS wishlist_items_count
      FROM
        wishlists
      WHERE
        wishlist_id = :wishlistId AND
        account_id = :accountId;`,
      { wishlistId, accountId }
    );

    const wishlistDetails = wishlistRows[0] as WishlistDetails | undefined;

    if (!wishlistDetails) {
      res.status(404).json({ message: 'Wishlist not found.', reason: 'wishlistNotFound.' });
      return;
    }

    if (wishlistDetails.wishlist_items_count >= WISHLIST_ITEMS_LIMIT) {
      res.status(409).json({ message: 'Wishlist items limit reached.', reason: 'itemLimitReached' });
      return;
    }

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

    const itemId: number = resultSetHeader.insertId;
    const sanitizedTags: [number, string][] = sanitizeWishlistItemTags(tags, itemId);

    sanitizedTags.length > 0 && (await insertWishlistItemTags(sanitizedTags, connection, req));

    interface Tag {
      id: number;
      name: string;
    }

    const [itemTags] = await connection.execute<RowDataPacket[]>(
      `SELECT
        tag_id AS id,
        tag_name AS name
      FROM
        wishlist_item_tags
      WHERE
        item_id = ?;`,
      [itemId]
    );

    const mappedWishlistItem: MappedWishlistItem = {
      item_id: itemId,
      added_on_timestamp: currentTimestamp,
      title,
      description,
      link,
      is_purchased: false,
      tags: [...(itemTags as Tag[])],
    };

    await connection.commit();
    res.status(201).json(mappedWishlistItem);
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

    if (err.errno === 1062 && err.sqlMessage?.endsWith(`for key 'title'`)) {
      const existingWishlistItem: MappedWishlistItem | null = await getWishlistItemByTitle(title, wishlistId, dbPool, req);
      existingWishlistItem
        ? res.status(409).json({
            message: 'Wishlist already contains this item.',
            reason: 'duplicateItemTitle',
            resData: { existingWishlistItem },
          })
        : res.status(500).json({ message: 'Internal server error.' });

      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  } finally {
    connection?.release();
  }
});

wishlistItemsRouter.patch('/', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  interface RequestData {
    wishlistId: string;
    itemId: number;
    title: string;
    description: string | null;
    link: string | null;
    tags: string[];
  }

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['wishlistId', 'itemId', 'title', 'description', 'link', 'tags'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  const { wishlistId, itemId, title, description, link, tags } = requestData;

  if (!isValidUuid(wishlistId)) {
    res.status(400).json({ message: 'Invalid wishlist ID.', reason: 'invalidWishlistId' });
    return;
  }

  if (!Number.isInteger(itemId)) {
    res.status(400).json({ message: 'Invalid wishlist item ID.', reason: 'invalidItemId' });
    return;
  }

  if (!isValidWishlistItemTitle(title)) {
    res.status(400).json({ message: 'Invalid title.', reason: 'invalidTitle' });
    return;
  }

  if (description && !isValidWishlistItemDescription(description)) {
    res.status(400).json({ message: 'Invalid description.', reason: 'invalidDescription' });
    return;
  }

  if (link && !isValidWishlistItemLink(link)) {
    res.status(400).json({ message: 'Invalid link.', reason: 'invalidLink' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, res);

  if (!accountId) {
    return;
  }

  let connection;

  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    interface WishlistItemDetails {
      added_on_timestamp: number;
      is_purchased: boolean;
      tags_count: number;
      is_wishlist_owner: boolean;
    }

    const [wishlistItemRows] = await connection.execute<RowDataPacket[]>(
      `SELECT
        added_on_timestamp,
        is_purchased,
        (SELECT COUNT(*) FROM wishlist_item_tags WHERE item_id = :itemId) AS tags_count,
        EXISTS (SELECT 1 FROM wishlists WHERE wishlist_id = :wishlistId AND account_id = :accountId) AS is_wishlist_owner
      FROM
        wishlist_items
      WHERE
        item_id = :itemId AND
        wishlist_id = :wishlistId;`,
      { wishlistId, accountId, itemId }
    );

    const wishlistItemDetails = wishlistItemRows[0] as WishlistItemDetails | undefined;

    if (!wishlistItemDetails) {
      res.status(404).json({ message: 'Item not found.', reason: 'itemNotFound' });
      await connection.rollback();

      return;
    }

    if (!wishlistItemDetails.is_wishlist_owner) {
      await connection.rollback();
      res.status(404).json({ message: 'Wishlist not found.', reason: 'wishlistNotFound' });

      return;
    }

    const [resultSetHeader] = await connection.execute<ResultSetHeader>(
      `UPDATE
        wishlist_items
      SET
        title = ?,
        description = ?,
        link = ?
      WHERE
        item_id = ?;`,
      [title, description, link, itemId]
    );

    if (resultSetHeader.affectedRows === 0) {
      await connection.rollback();
      res.status(500).json({ message: 'Internal server error.' });

      await logUnexpectedError(req, null, 'failed to update wishlist item');
      return;
    }

    const sanitizedTags: [number, string][] = sanitizeWishlistItemTags(tags, itemId);

    if (wishlistItemDetails.tags_count !== sanitizedTags.length) {
      const deletedSuccessfully: boolean =
        wishlistItemDetails.tags_count === 0 ? true : await deleteWishlistItemTags(itemId, connection, req);

      const insertedSuccessfully: boolean =
        sanitizedTags.length === 0 ? true : await insertWishlistItemTags(sanitizedTags, connection, req);

      if (!deletedSuccessfully || !insertedSuccessfully) {
        await connection.rollback();
        res.status(500).json({ message: 'Internal server error.' });

        return;
      }
    }

    interface Tag {
      id: number;
      name: string;
    }

    const [itemTags] = await connection.execute<RowDataPacket[]>(
      `SELECT
        tag_id AS id,
        tag_name AS name
      FROM
        wishlist_item_tags
      WHERE
        item_id = ?;`,
      [itemId]
    );

    const mappedWishlistItem: MappedWishlistItem = {
      item_id: itemId,
      added_on_timestamp: wishlistItemDetails.added_on_timestamp,
      title,
      description,
      link,
      is_purchased: wishlistItemDetails.is_purchased,
      tags: itemTags as Tag[],
    };

    await connection.commit();
    res.json(mappedWishlistItem);
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

    if (err.errno === 1062 && err.sqlMessage?.endsWith(`for key 'title'`)) {
      const existingWishlistItem: MappedWishlistItem | null = await getWishlistItemByTitle(title, wishlistId, dbPool, req);

      existingWishlistItem
        ? res.status(409).json({
            message: 'Wishlist already contains this item.',
            reason: 'duplicateItemTitle',
            resData: { existingWishlistItem },
          })
        : res.status(500).json({ message: 'Internal server error.' });

      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  } finally {
    connection?.release();
  }
});

wishlistItemsRouter.delete('/', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  const wishlistId = req.query.wishlistId;
  const itemId = req.query.itemId;

  if (typeof wishlistId !== 'string' || !isValidUuid(wishlistId)) {
    res.status(400).json({ message: 'Invalid wishlist ID.', reason: 'invalidWishlistId' });
    return;
  }

  if (typeof itemId !== 'string' || !Number.isInteger(+itemId)) {
    res.status(400).json({ message: 'invalid wishlist item ID.', reason: 'invalidItemId' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, res);

  if (!accountId) {
    return;
  }

  try {
    interface WishlistItemDetails {
      item_exists: boolean;
    }

    const [wishlistItemRows] = await dbPool.execute<RowDataPacket[]>(
      `SELECT
        EXISTS (SELECT 1 FROM wishlist_items WHERE item_id = ?) AS item_exists
      FROM
        wishlists
      WHERE
        wishlist_id = ? AND
        account_id = ?;`,
      [+itemId, wishlistId, accountId]
    );

    const wishlistItemDetails = wishlistItemRows[0] as WishlistItemDetails | undefined;

    if (!wishlistItemDetails) {
      res.status(404).json({ message: 'Wishlist not found.', reason: 'wishlistNotFound' });
      return;
    }

    if (!wishlistItemDetails.item_exists) {
      res.json({});
      return;
    }

    const [resultSetHeader] = await dbPool.execute<ResultSetHeader>(
      `DELETE FROM
        wishlist_items
      WHERE
        item_id = ?;`,
      [itemId]
    );

    if (resultSetHeader.affectedRows === 0) {
      res.status(500).json({ message: 'Internal server error.' });
      return;
    }

    res.json({});
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
  }
});

wishlistItemsRouter.patch('/purchaseStatus', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  interface RequestData {
    wishlistId: string;
    itemId: number;
    newPurchaseStatus: boolean;
  }

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['wishlistId', 'itemId', 'newPurchaseStatus'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  const { wishlistId, itemId, newPurchaseStatus } = requestData;

  if (!isValidUuid(wishlistId)) {
    res.status(400).json({ message: 'Invalid wishlist ID.', reason: 'invalidWishlistId' });
    return;
  }

  if (!Number.isInteger(itemId)) {
    res.status(400).json({ message: 'Invalid wishlist item ID.', reason: 'invalidItemId' });
    return;
  }

  if (typeof newPurchaseStatus !== 'boolean') {
    res.status(400).json({ message: 'Invalid purchase status.', reason: 'invalidPurchaseStatus' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, res);

  if (!accountId) {
    return;
  }

  try {
    interface WishlistItemDetails {
      is_purchased: boolean | null;
    }

    const [wishlistItemRows] = await dbPool.execute<RowDataPacket[]>(
      `SELECT
        (SELECT is_purchased FROM wishlist_items WHERE item_id = ?) AS is_purchased
      FROM
        wishlists
      WHERE
        wishlist_id = ? AND
        account_id = ?;`,
      [itemId, wishlistId, accountId]
    );

    const wishlistItemDetails = wishlistItemRows[0] as WishlistItemDetails | undefined;

    if (!wishlistItemDetails) {
      res.status(404).json({ message: 'Wishlist not found.', reason: 'wishlistNotfound' });
      return;
    }

    if (wishlistItemDetails.is_purchased === null) {
      res.status(404).json({ message: 'Wishlist Item not found.', reason: 'itemNotfound' });
      return;
    }

    if (Boolean(wishlistItemDetails.is_purchased) === newPurchaseStatus) {
      res.json({});
      return;
    }

    const [resultSetHeader] = await dbPool.execute<ResultSetHeader>(
      `UPDATE
        wishlist_items
      SET
        is_purchased = ?
      WHERE
        item_id = ?;`,
      [newPurchaseStatus, itemId]
    );

    if (resultSetHeader.affectedRows === 0) {
      res.status(500).json({ message: 'Internal server error.' });
      return;
    }

    res.json({});
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
  }
});
