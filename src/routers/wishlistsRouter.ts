import express, { Router, Request, Response } from 'express';
import { generateCryptoUuid, isValidUuid } from '../util/tokenGenerator';
import { undefinedValuesDetected } from '../util/validation/requestValidation';
import { isValidWishlistPrivacyLevel, isValidWishlistTitle } from '../util/validation/wishlistValidation';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { getAccountIdByAuthSessionId } from '../db/helpers/authDbHelpers';
import { logUnexpectedError } from '../logs/errorLogger';
import { dbPool } from '../db/db';
import { TOTAL_WISHLISTS_LIMIT, WISHLIST_INTERACTION_CREATE, WISHLIST_ITEMS_LIMIT } from '../util/constants/wishlistConstants';
import { generatePlaceHolders } from '../util/sqlUtils/generatePlaceHolders';
import { isSqlError } from '../util/sqlUtils/isSqlError';
import { getAuthSessionId } from '../auth/authUtils';
import { MappedWishlistItem } from './wishlistItemsRouter';
import { WISHLIST_ITEM_TAGS_LIMIT } from '../util/constants/wishlistItemConstants';
import { WishlistItem } from '../db/helpers/wishlistItemsDbHelpers';
import { isValidWishlistItemTitle } from '../util/validation/wishlistItemValidation';

export const wishlistsRouter: Router = express.Router();

wishlistsRouter.post('/', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  type RequestData = {
    privacyLevel: number;
    title: string;
  };

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

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

  if (!accountId) {
    return;
  }

  try {
    type AccountWishlistsDetails = {
      wishlists_created_count: number;
      title_already_used: boolean;
    };

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
      await logUnexpectedError(req, null, 'Failed to fetch wishlists_created_count.');

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
        created_on_timestamp,
        latest_interaction_timestamp,
        interactivity_index,
        is_favorited
      ) VALUES (${generatePlaceHolders(8)});`,
      [wishlistId, accountId, privacyLevel, title, currentTimestamp, currentTimestamp, WISHLIST_INTERACTION_CREATE, false]
    );

    res.status(201).json({ wishlistId });
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
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

wishlistsRouter.get('/crossWishlistSearch/:itemTitleQuery', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  const itemTitleQuery: string | undefined = req.params.itemTitleQuery;

  if (!itemTitleQuery || !isValidWishlistItemTitle(itemTitleQuery)) {
    res.status(400).json({ message: 'Invalid search query.', reason: 'invalidQuery' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

  if (!accountId) {
    return;
  }

  try {
    type WishlistDetails = {
      wishlist_id: string;
    };

    const [wishlistRows] = await dbPool.execute<RowDataPacket[]>(
      `SELECT
        wishlist_id
      FROM
        wishlists
      WHERE
        account_id = ? AND
        EXISTS (
          SELECT
            1
          FROM
            wishlist_items
          WHERE
            wishlist_id = wishlists.wishlist_id AND
            title LIKE ?
        )
      LIMIT ?;`,
      [accountId, `%${itemTitleQuery}%`, TOTAL_WISHLISTS_LIMIT]
    );

    const wishlistIdsArr: string[] = (wishlistRows as WishlistDetails[]).map(({ wishlist_id }: WishlistDetails) => wishlist_id);

    res.json(wishlistIdsArr);
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  }
});

wishlistsRouter.get('/all', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

  if (!accountId) {
    return;
  }

  try {
    type Wishlist = {
      wishlist_id: string;
      privacy_level: string;
      title: string;
      created_on_timestamp: number;
      is_favorited: boolean;
      interactivity_index: number;
      latest_interaction_timestamp: number;
      items_count: number;
      purchased_items_count: number;
      total_items_price: number;
      price_to_complete: number;
    };

    const [wishlists] = await dbPool.execute<RowDataPacket[]>(
      `SELECT
        wishlists.wishlist_id,
        wishlists.privacy_level,
        wishlists.title,
        wishlists.created_on_timestamp,
        wishlists.is_favorited,
        wishlists.interactivity_index,
        wishlists.latest_interaction_timestamp,

        COUNT(wishlist_items.item_id) AS items_count,
        COALESCE(SUM(
          CASE
            WHEN wishlist_items.purchased_on_timestamp IS NULL
              THEN 0
            ELSE 1
          END
        ), 0)AS purchased_items_count,
        COALESCE(SUM(wishlist_items.price), 0) AS total_items_price,
        COALESCE(SUM(
          CASE
            WHEN wishlist_items.purchased_on_timestamp IS NULL
              THEN wishlist_items.price
            ELSE 0
          END
        ), 0) AS price_to_complete
      FROM
        wishlists
      LEFT JOIN
        wishlist_items USING(wishlist_id)
      WHERE
        wishlists.account_id = ?
      GROUP BY
        wishlists.wishlist_id
      ORDER BY
        interactivity_index DESC,
        latest_interaction_timestamp DESC
      LIMIT ?;`,
      [accountId, TOTAL_WISHLISTS_LIMIT]
    );

    const combinedWishlistsStatistics: {
      totalItemsCount: number;
      totalPurchasedItemsCount: number;
      totalWishlistsWorth: number;
      totalWishlistsSpent: number;
      totalWishlistsToComplete: number;
    } = {
      totalItemsCount: 0,
      totalPurchasedItemsCount: 0,
      totalWishlistsWorth: 0,
      totalWishlistsSpent: 0,
      totalWishlistsToComplete: 0,
    };

    for (const wishlist of wishlists as Wishlist[]) {
      combinedWishlistsStatistics.totalItemsCount += wishlist.items_count;
      combinedWishlistsStatistics.totalPurchasedItemsCount += wishlist.purchased_items_count;
      combinedWishlistsStatistics.totalWishlistsWorth += wishlist.total_items_price;
      combinedWishlistsStatistics.totalWishlistsSpent += wishlist.total_items_price - wishlist.price_to_complete;
      combinedWishlistsStatistics.totalWishlistsToComplete += wishlist.price_to_complete;
    }

    res.json({ combinedWishlistsStatistics, wishlists: wishlists as Wishlist[] });
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
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

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

  if (!accountId) {
    return;
  }

  try {
    type WishlistDetails = {
      privacy_level: number;
      title: string;
      created_on_timestamp: number;
      is_favorited: boolean;
    };

    const [wishlistRows] = await dbPool.execute<RowDataPacket[]>(
      `SELECT
        privacy_level,
        title,
        created_on_timestamp,
        is_favorited
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

    const [wishlistItems] = await dbPool.execute<RowDataPacket[]>(
      `SELECT
        wishlist_items.item_id,
        wishlist_items.added_on_timestamp,
        wishlist_items.title,
        wishlist_items.description,
        wishlist_items.link,
        wishlist_items.price,
        wishlist_items.purchased_on_timestamp,
        
        wishlist_item_tags.tag_id,
        wishlist_item_tags.tag_name
      FROM 
        wishlist_items
      LEFT JOIN
        wishlist_item_tags USING(item_id)
      WHERE
        wishlist_items.wishlist_id = ?
      ORDER BY
        wishlist_items.added_on_timestamp DESC,
        wishlist_item_tags.tag_name ASC
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
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
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

  type RequestData = {
    wishlistId: string;
    newTitle: string;
  };

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

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

  if (!accountId) {
    return;
  }

  try {
    type WishlistDetails = {
      title: string;
      new_title_used_elsewhere: boolean;
    };

    const [wishlistRows] = await dbPool.execute<RowDataPacket[]>(
      `SELECT
        title,
        EXISTS (
          SELECT
            1
          FROM
            wishlists
          WHERE
            title = :newTitle AND
            account_id = :accountId AND
            wishlist_id != :wishlistId
        ) AS new_title_used_elsewhere
      FROM
        wishlists
      WHERE
        wishlist_id = :wishlistId AND
        account_id = :accountId;`,
      { newTitle, wishlistId, accountId }
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

    if (wishlistDetails.new_title_used_elsewhere) {
      res.status(409).json({ message: 'You already have a wishlist with this title.', reason: 'duplicateTitle' });
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
      await logUnexpectedError(req, null, 'Failed to update title.');

      return;
    }

    res.json({});
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
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

wishlistsRouter.patch('/change/privacyLevel', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  type RequestData = {
    wishlistId: string;
    newPrivacyLevel: number;
  };

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

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

  if (!accountId) {
    return;
  }

  try {
    type WishlistDetails = {
      privacy_level: number;
    };

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
      await logUnexpectedError(req, null, 'Failed to update privacy_level.');

      return;
    }

    res.json({});
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  }
});

wishlistsRouter.patch('/change/favorite', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  console.log(req.body);
  type RequestData = {
    wishlistId: string;
    newIsFavorited: boolean;
  };

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['wishlistId', 'newIsFavorited'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  const { wishlistId, newIsFavorited } = requestData;

  if (!isValidUuid(wishlistId)) {
    res.status(400).json({ message: 'Invalid wishlist ID.', reason: 'invalidWishlistId' });
    return;
  }

  if (typeof newIsFavorited !== 'boolean') {
    res.status(400).json({ message: 'Invalid favorite value.', reason: 'invalidFavoriteValue' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

  if (!accountId) {
    return;
  }

  try {
    type WishlistDetails = {
      is_favorited: boolean;
    };

    const [wishlistRows] = await dbPool.execute<RowDataPacket[]>(
      `SELECT
        is_favorited
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

    if (wishlistDetails.is_favorited === newIsFavorited) {
      res.json({});
      return;
    }

    const [resultSetHeader] = await dbPool.execute<ResultSetHeader>(
      `UPDATE
        wishlists
      SET
        is_favorited = ?
      WHERE
        wishlist_id = ?;`,
      [newIsFavorited, wishlistId]
    );

    if (resultSetHeader.affectedRows === 0) {
      res.status(500).json({ message: 'Internal server error.' });
      await logUnexpectedError(req, null, 'Failed to update is_favorited.');

      return;
    }

    res.json({});
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  }
});

wishlistsRouter.delete('/empty', async (req: Request, res: Response) => {
  const authSessionId: string | null = getAuthSessionId(req, res);

  if (!authSessionId) {
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

  if (!accountId) {
    return;
  }

  try {
    await dbPool.execute<ResultSetHeader>(
      `DELETE FROM
        wishlists
      WHERE
        account_id = ? AND
        NOT EXISTS (
          SELECT 1 FROM wishlist_items WHERE wishlist_items.wishlist_id = wishlists.wishlist_id
        )
      LIMIT ?;`,
      [accountId, TOTAL_WISHLISTS_LIMIT]
    );

    res.json({});
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
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

  if (!wishlistId || !isValidUuid(wishlistId)) {
    res.status(400).json({ message: 'Invalid wishlist ID.', reason: 'invalidWishlistId' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, req, res);

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
      await logUnexpectedError(req, null, 'Failed to delete wishlist.');

      return;
    }

    res.json({});
  } catch (err: unknown) {
    console.log(err);

    if (res.headersSent) {
      await logUnexpectedError(req, err, 'Attempted to send two responses.');
      return;
    }

    res.status(500).json({ message: 'Internal server error.' });
    await logUnexpectedError(req, err);
  }
});
