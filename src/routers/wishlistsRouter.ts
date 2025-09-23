import express, { Router, Request, Response } from 'express';
import { generateCryptoUuid, isValidUuid } from '../util/tokenGenerator';
import { undefinedValuesDetected } from '../util/validation/requestValidation';
import { isValidWishlistPrivacyLevel, isValidWishlistTitle } from '../util/validation/wishlistValidation';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { getAccountIdByAuthSessionId } from '../db/helpers/authDbHelpers';
import { logUnexpectedError } from '../logs/errorLogger';
import { dbPool } from '../db/db';
import { TOTAL_WISHLISTS_LIMIT, WISHLIST_ITEMS_LIMIT } from '../util/constants/wishlistConstants';
import { generatePlaceHolders } from '../util/sqlUtils/generatePlaceHolders';
import { isSqlError } from '../util/sqlUtils/isSqlError';
import { getAuthSessionId } from '../auth/authUtils';
import { MappedWishlistItem } from './wishlistItemsRouter';
import { WISHLIST_ITEM_TAGS_LIMIT } from '../util/constants/wishlistItemConstants';

export const wishlistsRouter: Router = express.Router();

wishlistsRouter.post('/', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  interface RequestData {
    privacyLevel: number;
    title: string;
  }

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['privacyLevel', 'title'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  const { privacyLevel, title } = requestData;

  if (!isValidWishlistPrivacyLevel(privacyLevel)) {
    res.status(400).json({ message: 'Invalid privacy level.', reason: 'invalidPrivacyLevel' });
    return;
  }

  if (!isValidWishlistTitle(title)) {
    res.status(400).json({ message: 'Invalid title.', reason: 'invalidTitle' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, res);

  if (!accountId) {
    return;
  }

  try {
    interface AccountWishlistsDetails {
      wishlists_created_count: number;
      title_already_used: boolean;
    }

    const [accountWishlistsRows] = await dbPool.execute<RowDataPacket[]>(
      `SELECT
        COUNT(*) AS wishlists_created_count,
        EXISTS (SELECT 1 FROM wishlists WHERE title = :title AND account_id = :accountId ) AS title_already_used
      FROM
        wishlists
      WHERE
        account_id = :accountId;`,
      { accountId, title: title }
    );

    const accountWishlistsDetails = accountWishlistsRows[0] as AccountWishlistsDetails | undefined;

    if (!accountWishlistsDetails) {
      res.status(500).json({ message: 'Internal server error.' });
      return;
    }

    if (accountWishlistsDetails.wishlists_created_count >= TOTAL_WISHLISTS_LIMIT) {
      res.status(403).json({ message: 'Wishlists limit reached.', reason: 'wishlistLimitReached' });
      return;
    }

    if (accountWishlistsDetails.title_already_used) {
      res.status(409).json({ message: 'You already have a wishlist with this title.', reason: 'duplicateTitle' });
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
        created_on_timestamp
      ) VALUES (${generatePlaceHolders(5)});`,
      [wishlistId, accountId, privacyLevel, title, currentTimestamp]
    );

    res.status(201).json({ wishlistId });
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

    if (err.errno === 1062 && err.sqlMessage?.endsWith(`for key 'account_id'`)) {
      res.status(409).json({ message: 'You already have a wishlist with this title.', reason: 'duplicateTitle' });
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  }
});

wishlistsRouter.get('/:wishlistId', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  const wishlistId: string | undefined = req.params.wishlistId;

  if (!wishlistId || !isValidUuid(wishlistId)) {
    res.status(400).json({ message: 'Invalid wishlist ID.', reason: 'invalidWishlistId' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, res);

  if (!accountId) {
    return;
  }

  try {
    interface WishlistDetails {
      privacy_level: number;
      title: string;
      created_on_timestamp: number;
    }

    const [wishlistRows] = await dbPool.execute<RowDataPacket[]>(
      `SELECT
        privacy_level,
        title,
        created_on_timestamp
      FROM
        wishlists
      WHERE
        wishlist_id = ? AND
        account_id = ?;`,
      [wishlistId, accountId]
    );

    const wishlistDetails = wishlistRows[0] as WishlistDetails | undefined;

    if (!wishlistDetails) {
      res.status(404).json({ message: 'Wishlist not found.', reason: 'wishlistNotFound' });
      return;
    }

    interface WishlistItem {
      item_id: number;
      added_on_timestamp: number;
      title: string;
      description: string | null;
      link: string | null;
      is_purchased: boolean;
      tag_id: number;
      tag_name: string;
    }

    const [wishlistItems] = await dbPool.execute<RowDataPacket[]>(
      `SELECT
        wishlist_items.item_id,
        wishlist_items.added_on_timestamp,
        wishlist_items.title,
        wishlist_items.description,
        wishlist_items.link,
        wishlist_items.is_purchased,
        wishlist_item_tags.tag_id,
        wishlist_item_tags.tag_name
      FROM 
        wishlist_items
      LEFT JOIN
        wishlist_item_tags USING(item_id)
      WHERE
        wishlist_items.wishlist_id = ?
      ORDER BY
        wishlist_items.added_on_timestamp DESC
      LIMIT ?;`,
      [wishlistId, WISHLIST_ITEMS_LIMIT * WISHLIST_ITEM_TAGS_LIMIT]
    );

    const mappedWishlistItems: MappedWishlistItem[] = [];
    let currentItemId: number = 0;

    for (const item of wishlistItems as WishlistItem[]) {
      const { tag_id, tag_name, ...rest } = item;

      if (item.item_id === currentItemId) {
        const mappedWishlistItem: MappedWishlistItem | undefined = mappedWishlistItems[mappedWishlistItems.length - 1];
        mappedWishlistItem?.tags.push({ id: tag_id, name: tag_name });

        continue;
      }

      currentItemId = item.item_id;
      const mappedItem: MappedWishlistItem = {
        ...rest,
        tags: tag_id
          ? [
              {
                id: tag_id,
                name: tag_name,
              },
            ]
          : [],
      };

      mappedWishlistItems.push(mappedItem);
    }

    res.json({ wishlistDetails, wishlistItems: mappedWishlistItems });
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  }
});

wishlistsRouter.patch('/change/title', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  interface RequestData {
    wishlistId: string;
    newTitle: string;
  }

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['wishlistId', 'newTitle'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  const { wishlistId, newTitle } = requestData;

  if (!isValidUuid(wishlistId)) {
    res.status(400).json({ message: 'Invalid wishlist ID.', reason: 'invalidWishlistId' });
    return;
  }

  if (!isValidWishlistTitle(newTitle)) {
    res.status(400).json({ message: 'Invalid wishlist title.', reason: 'invalidTitle' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, res);

  if (!accountId) {
    return;
  }

  try {
    interface WishlistDetails {
      title: string;
    }

    const [wishlistRows] = await dbPool.execute<RowDataPacket[]>(
      `SELECT
        title
      FROM
        wishlists
      WHERE
        wishlist_id = ? AND
        account_id = ?;`,
      [wishlistId, accountId]
    );

    const wishlistDetails = wishlistRows[0] as WishlistDetails | undefined;

    if (!wishlistDetails) {
      res.status(404).json({ message: 'Wishlist not found.', reason: 'wishlistNotfound' });
      return;
    }

    if (wishlistDetails.title === newTitle) {
      res.status(409).json({ message: 'Wishlist already has this title.', reason: 'identicalTitle' });
      return;
    }

    const [resultSetHeader] = await dbPool.execute<ResultSetHeader>(
      `UPDATE
        wishlists
      SET
        title = ?
      WHERE
        wishlist_id = ?;`,
      [newTitle, wishlistId]
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
    await logUnexpectedError(req, err);
  }
});

wishlistsRouter.patch('/change/privacyLevel', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  interface RequestData {
    wishlistId: string;
    newPrivacyLevel: number;
  }

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['wishlistId', 'newPrivacyLevel'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  const { wishlistId, newPrivacyLevel } = requestData;

  if (!isValidUuid(wishlistId)) {
    res.status(400).json({ message: 'Invalid wishlist ID.', reason: 'invalidWishlistId' });
    return;
  }

  if (!isValidWishlistPrivacyLevel(newPrivacyLevel)) {
    res.status(400).json({ message: 'Invalid privacy level.', reason: 'invalidPrivacyLevel' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, res);

  if (!accountId) {
    return;
  }

  try {
    interface WishlistDetails {
      privacy_level: number;
    }

    const [wishlistRows] = await dbPool.execute<RowDataPacket[]>(
      `SELECT
        privacy_level
      FROM
        wishlists
      WHERE
        wishlist_id = ? AND
        account_id = ?;`,
      [wishlistId, accountId]
    );

    const wishlistDetails = wishlistRows[0] as WishlistDetails | undefined;

    if (!wishlistDetails) {
      res.status(404).json({ message: 'Wishlist not found.', reason: 'wishlistNotFound' });
      return;
    }

    if (wishlistDetails.privacy_level === newPrivacyLevel) {
      res.json({});
      return;
    }

    const [resultSetHeader] = await dbPool.execute<ResultSetHeader>(
      `UPDATE
        wishlists
      SET
        privacy_level = ?
      WHERE
        wishlist_id = ?;`,
      [newPrivacyLevel, wishlistId]
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
    await logUnexpectedError(req, err);
  }
});

wishlistsRouter.delete('/:wishlistId', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  const wishlistId: string | undefined = req.params.wishlistId;

  if (!wishlistId) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  if (!isValidUuid(wishlistId)) {
    res.status(400).json({ message: 'Invalid wishlist ID.', reason: 'invalidWishlistId' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, res);

  if (!accountId) {
    return;
  }

  try {
    const [wishlistRows] = await dbPool.execute<RowDataPacket[]>(
      `SELECT
        1
      FROM
        wishlists
      WHERE
        wishlist_id = ? AND
        account_id = ?;`,
      [wishlistId, accountId]
    );

    if (wishlistRows.length === 0) {
      res.status(404).json({ message: 'Wishlist not found.', reason: 'wishlistNotfound' });
      return;
    }

    const [resultSetHeader] = await dbPool.execute<ResultSetHeader>(
      `DELETE FROM
        wishlists
      WHERE
        wishlist_id = ?;`,
      [wishlistId]
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
    await logUnexpectedError(req, err);
  }
});
