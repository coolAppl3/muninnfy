import express, { Router, Request, Response } from 'express';
import { isValidUuid } from '../util/tokenGenerator';
import { undefinedValuesDetected } from '../util/validation/requestValidation';
import {
  isValidWishlistItemDescription,
  isValidWishlistItemLink,
  isValidWishlistItemPrice,
  isValidWishlistItemTitle,
} from '../util/validation/wishlistItemValidation';
import { getAccountIdByAuthSessionId } from '../db/helpers/authDbHelpers';
import { dbPool } from '../db/db';
import { generatePlaceHolders } from '../util/sqlUtils/generatePlaceHolders';
import { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { isSqlError } from '../util/sqlUtils/isSqlError';
import { logUnexpectedError } from '../logs/errorLogger';
import {
  WISHLIST_INTERACTION_ADD_ITEM,
  WISHLIST_INTERACTION_BULK_BORDER,
  WISHLIST_INTERACTION_BULK_LARGE,
  WISHLIST_INTERACTION_BULK_SMALL,
  WISHLIST_INTERACTION_GENERAL,
  WISHLIST_ITEMS_LIMIT,
} from '../util/constants/wishlistConstants';
import { sanitizeWishlistItemTags } from '../util/validation/wishlistItemTagValidation';
import { deleteWishlistItemTags, insertWishlistItemTags } from '../db/helpers/wishlistItemTagsDbHelpers';
import { getWishlistItemByTitle } from '../db/helpers/wishlistItemsDbHelpers';
import { getAuthSessionId } from '../auth/authUtils';
import { incrementWishlistInteractivityIndex } from '../db/helpers/wishlistsDbHelpers';

export const wishlistItemsRouter: Router = express.Router();

export type MappedWishlistItem = {
  item_id: number;
  added_on_timestamp: number;
  title: string;
  description: string | null;
  link: string | null;
  price: number | null;
  purchased_on_timestamp: number | null;
  tags: {
    id: number;
    name: string;
  }[];
};

wishlistItemsRouter.post('/', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  type RequestData = {
    wishlistId: string;
    title: string;
    description: string | null;
    link: string | null;
    price: number | null;
    tags: string[];
  };

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['wishlistId', 'title', 'description', 'link', 'price', 'tags'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  const { wishlistId, title, description, link, price, tags } = requestData;

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

  if (price && !isValidWishlistItemPrice(price)) {
    res.status(400).json({ message: 'Invalid price.', reason: 'invalidPrice' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, res);

  if (!accountId) {
    return;
  }

  let connection: PoolConnection | null = null;

  try {
    type WishlistDetails = {
      wishlist_items_count: number;
    };

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
        price,
        purchased_on_timestamp
      ) VALUES (${generatePlaceHolders(7)});`,
      [wishlistId, currentTimestamp, title, description, link, price, null]
    );

    const itemId: number = resultSetHeader.insertId;
    const sanitizedTags: [number, string][] = sanitizeWishlistItemTags(tags, itemId);

    sanitizedTags.length > 0 && (await insertWishlistItemTags(sanitizedTags, connection, req));

    type Tag = {
      id: number;
      name: string;
    };

    const [itemTags] = await connection.execute<RowDataPacket[]>(
      `SELECT
        tag_id AS id,
        tag_name AS name
      FROM
        wishlist_item_tags
      WHERE
        item_id = ?
      ORDER BY
        tag_name ASC;`,
      [itemId]
    );

    const mappedWishlistItem: MappedWishlistItem = {
      item_id: itemId,
      added_on_timestamp: currentTimestamp,
      title,
      description,
      link,
      price,
      purchased_on_timestamp: null,
      tags: itemTags as Tag[],
    };

    await connection.commit();
    res.status(201).json(mappedWishlistItem);

    await incrementWishlistInteractivityIndex(wishlistId, WISHLIST_INTERACTION_ADD_ITEM, dbPool, req);
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

      if (!existingWishlistItem) {
        res.status(500).json({ message: 'Internal server error.' });
        await logUnexpectedError(req, err, 'Detected a duplicate wishlist item title, but failed to fetch it.');

        return;
      }

      res.status(409).json({
        message: 'Another item already uses this title.',
        reason: 'duplicateItemTitle',
        resData: { existingWishlistItem },
      });

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

  type RequestData = {
    wishlistId: string;
    itemId: number;
    title: string;
    description: string | null;
    link: string | null;
    price: number | null;
    tags: string[];
  };

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['wishlistId', 'itemId', 'title', 'description', 'link', 'price', 'tags'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  const { wishlistId, itemId, title, description, link, price, tags } = requestData;

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

  if (price && !isValidWishlistItemPrice(price)) {
    res.status(400).json({ message: 'Invalid price.', reason: 'invalidPrice' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, res);

  if (!accountId) {
    return;
  }

  let connection: PoolConnection | null = null;

  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    type WishlistItemDetails = {
      added_on_timestamp: number;
      purchased_on_timestamp: number | null;
      tags_count: number;
      is_wishlist_owner: boolean;
    };

    const [wishlistItemRows] = await connection.execute<RowDataPacket[]>(
      `SELECT
        added_on_timestamp,
        purchased_on_timestamp,
        
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
      await connection.rollback();
      res.status(404).json({ message: 'Item not found.', reason: 'itemNotFound' });

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
        link = ?,
        price = ?
      WHERE
        item_id = ?;`,
      [title, description, link, price, itemId]
    );

    if (resultSetHeader.affectedRows === 0) {
      await connection.rollback();
      res.status(500).json({ message: 'Internal server error.' });

      await logUnexpectedError(req, null, 'Failed to update wishlist item.');
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

    type Tag = {
      id: number;
      name: string;
    };

    const [itemTags] = await connection.execute<RowDataPacket[]>(
      `SELECT
        tag_id AS id,
        tag_name AS name
      FROM
        wishlist_item_tags
      WHERE
        item_id = ?
      ORDER BY
        tag_name ASC;`,
      [itemId]
    );

    const mappedWishlistItem: MappedWishlistItem = {
      item_id: itemId,
      added_on_timestamp: wishlistItemDetails.added_on_timestamp,
      title,
      description,
      link,
      price,
      purchased_on_timestamp: wishlistItemDetails.purchased_on_timestamp,
      tags: itemTags as Tag[],
    };

    await connection.commit();
    res.json(mappedWishlistItem);

    await incrementWishlistInteractivityIndex(wishlistId, WISHLIST_INTERACTION_GENERAL, dbPool, req);
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

      if (!existingWishlistItem) {
        res.status(500).json({ message: 'Internal server error.' });
        await logUnexpectedError(req, err, 'Detected a duplicate wishlist item title, but failed to fetch it.');

        return;
      }

      res.status(409).json({
        message: 'Another item already uses this title.',
        reason: 'duplicateItemTitle',
        resData: { existingWishlistItem },
      });

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
    type WishlistItemDetails = {
      item_exists: boolean;
    };

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
      await logUnexpectedError(req, null, 'Failed to delete wishlist item.');

      return;
    }

    res.json({});

    await incrementWishlistInteractivityIndex(wishlistId, WISHLIST_INTERACTION_GENERAL, dbPool, req);
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  }
});

wishlistItemsRouter.delete('/bulk', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  type RequestData = {
    wishlistId: string;
    itemsIdArr: number[];
  };

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['wishlistId', 'itemsIdArr'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  const { wishlistId, itemsIdArr } = requestData;

  if (!isValidUuid(wishlistId)) {
    res.status(400).json({ message: 'Invalid wishlist ID.', reason: 'invalidWishlistId' });
    return;
  }

  if (itemsIdArr.length === 0 || itemsIdArr.length > WISHLIST_ITEMS_LIMIT) {
    res.status(400).json({ message: 'Invalid items selection.', reason: 'invalidItemsArr' });
    return;
  }

  for (const id of itemsIdArr) {
    if (!Number.isInteger(id)) {
      res.status(400).json({ message: 'Invalid items selection.', reason: 'invalidItemsArr' });
      return;
    }
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, res);

  if (!accountId) {
    return;
  }

  try {
    type WishlistDetails = {
      is_wishlist_owner: boolean;
    };

    const [wishlistRows] = await dbPool.execute<RowDataPacket[]>(
      `SELECT
        1 AS is_wishlist_owner
      FROM
        wishlists
      WHERE
        wishlist_id = ? AND
        account_id = ?;`,
      [wishlistId, accountId]
    );

    const wishlistDetails = wishlistRows[0] as WishlistDetails | undefined;

    if (!wishlistDetails || !wishlistDetails.is_wishlist_owner) {
      res.status(404).json({ message: 'Wishlist not found.', reason: 'wishlistNotFound' });
      return;
    }

    const [resultSetHeader] = await dbPool.query<ResultSetHeader>(
      `DELETE FROM
        wishlist_items
      WHERE
        wishlist_id = ? AND
        item_id IN (?)
      LIMIT ${WISHLIST_ITEMS_LIMIT};`,
      [wishlistId, itemsIdArr]
    );

    res.json({ deletedItemsCount: resultSetHeader.affectedRows });

    await incrementWishlistInteractivityIndex(
      wishlistId,
      itemsIdArr.length > WISHLIST_INTERACTION_BULK_BORDER ? WISHLIST_INTERACTION_BULK_LARGE : WISHLIST_INTERACTION_BULK_SMALL,
      dbPool,
      req
    );
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  }
});

wishlistItemsRouter.patch('/purchaseStatus', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  type RequestData = {
    wishlistId: string;
    itemId: number;
    markAsPurchased: boolean;
  };

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['wishlistId', 'itemId', 'markAsPurchased'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  const { wishlistId, itemId, markAsPurchased } = requestData;

  if (!isValidUuid(wishlistId)) {
    res.status(400).json({ message: 'Invalid wishlist ID.', reason: 'invalidWishlistId' });
    return;
  }

  if (!Number.isInteger(itemId)) {
    res.status(400).json({ message: 'Invalid wishlist item ID.', reason: 'invalidItemId' });
    return;
  }

  if (typeof markAsPurchased !== 'boolean') {
    res.status(400).json({ message: 'Invalid purchase status.', reason: 'invalidPurchaseStatus' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, res);

  if (!accountId) {
    return;
  }

  try {
    type WishlistItemDetails = {
      item_exists: boolean;
      purchased_on_timestamp: number | null;
    };

    const [wishlistItemRows] = await dbPool.execute<RowDataPacket[]>(
      `SELECT
        EXISTS (SELECT 1 FROM wishlist_items WHERE item_id = :itemId) AS item_exists,
        (SELECT purchased_on_timestamp FROM wishlist_items WHERE item_id = :itemId) AS purchased_on_timestamp
      FROM
        wishlists
      WHERE
        wishlist_id = :wishlistId AND
        account_id = :accountId;`,
      { itemId, wishlistId, accountId }
    );

    const wishlistItemDetails = wishlistItemRows[0] as WishlistItemDetails | undefined;

    if (!wishlistItemDetails) {
      res.status(404).json({ message: 'Wishlist not found.', reason: 'wishlistNotfound' });
      return;
    }

    if (!wishlistItemDetails.item_exists) {
      res.status(404).json({ message: 'Wishlist Item not found.', reason: 'itemNotfound' });
      return;
    }

    if (Boolean(wishlistItemDetails.purchased_on_timestamp) === markAsPurchased) {
      res.json({ newPurchasedOnTimestamp: wishlistItemDetails.purchased_on_timestamp });
      return;
    }

    const newPurchasedOnTimestamp: number | null = markAsPurchased ? Date.now() : null;

    const [resultSetHeader] = await dbPool.execute<ResultSetHeader>(
      `UPDATE
        wishlist_items
      SET
        purchased_on_timestamp = ?
      WHERE
        item_id = ?;`,
      [newPurchasedOnTimestamp, itemId]
    );

    if (resultSetHeader.affectedRows === 0) {
      res.status(500).json({ message: 'Internal server error.' });
      await logUnexpectedError(req, null, 'Failed to update purchased_on_timestamp.');

      return;
    }

    res.json({ newPurchasedOnTimestamp });

    await incrementWishlistInteractivityIndex(wishlistId, WISHLIST_INTERACTION_GENERAL, dbPool, req);
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  }
});

wishlistItemsRouter.patch('/purchaseStatus/bulk', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  type RequestData = {
    wishlistId: string;
    itemsIdArr: number[];
    markAsPurchased: boolean;
  };

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['wishlistId', 'itemsIdArr', 'markAsPurchased'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  const { wishlistId, itemsIdArr, markAsPurchased } = requestData;

  if (!isValidUuid(wishlistId)) {
    res.status(400).json({ message: 'Invalid wishlist ID.', reason: 'invalidWishlistId' });
    return;
  }

  if (typeof markAsPurchased !== 'boolean') {
    res.status(400).json({ message: 'Invalid purchase status.', reason: 'invalidPurchaseStatus' });
    return;
  }

  if (itemsIdArr.length === 0 || itemsIdArr.length > WISHLIST_ITEMS_LIMIT) {
    res.status(400).json({ message: 'Invalid items selection', reason: 'invalidItemsArr' });
    return;
  }

  for (const id of itemsIdArr) {
    if (!Number.isInteger(id)) {
      res.status(400).json({ message: 'Invalid items selection', reason: 'invalidItemsArr' });
      return;
    }
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, res);

  if (!accountId) {
    return;
  }

  try {
    type WishlistDetails = {
      is_wishlist_owner: boolean;
    };

    const [wishlistRows] = await dbPool.execute<RowDataPacket[]>(
      `SELECT
        1 AS is_wishlist_owner
      FROM
        wishlists
      WHERE
        wishlist_id = ? AND
        account_id = ?;`,
      [wishlistId, accountId]
    );

    const wishlistDetails = wishlistRows[0] as WishlistDetails | undefined;

    if (!wishlistDetails || !wishlistDetails.is_wishlist_owner) {
      res.status(404).json({ message: 'Wishlist not found.', reason: 'wishlistNotFound' });
      return;
    }

    const newPurchasedOnTimestamp: number | null = markAsPurchased ? Date.now() : null;

    const [resultSetHeader] = await dbPool.query<ResultSetHeader>(
      `UPDATE
        wishlist_items
      SET
        purchased_on_timestamp = ?
      WHERE
        wishlist_id = ? AND
        item_id IN (?)
      LIMIT ${WISHLIST_ITEMS_LIMIT};`,
      [newPurchasedOnTimestamp, wishlistId, itemsIdArr]
    );

    res.json({ newPurchasedOnTimestamp, updatedItemsCount: resultSetHeader.affectedRows });

    await incrementWishlistInteractivityIndex(
      wishlistId,
      itemsIdArr.length > WISHLIST_INTERACTION_BULK_BORDER ? WISHLIST_INTERACTION_BULK_LARGE : WISHLIST_INTERACTION_BULK_SMALL,
      dbPool,
      req
    );
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  }
});
