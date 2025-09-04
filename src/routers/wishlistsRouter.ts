import express, { Router, Request, Response } from 'express';
import { getRequestCookie, removeRequestCookie } from '../util/cookieUtils';
import { generateCryptoUuid, isValidUuid } from '../util/tokenGenerator';
import { undefinedValuesDetected } from '../util/validation/requestValidation';
import { isValidWishlistPrivacyLevel, isValidWishlistTitle } from '../util/validation/wishlistValidation';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { getAccountIdByAuthSessionId } from '../db/helpers/authDbHelpers';
import { logUnexpectedError } from '../logs/errorLogger';
import { dbPool } from '../db/db';
import { TOTAL_WISHLISTS_LIMIT } from '../util/constants/wishlistConstants';
import { generatePlaceHolders } from '../util/sqlUtils/generatePlaceHolders';
import { getWishlistPrivacyLevelName } from '../util/wishlistUtils';

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
  }

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['privacyLevel', 'title'];
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

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, res);

  if (!accountId) {
    return;
  }

  try {
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
        created_on_timestamp
      ) VALUES (${generatePlaceHolders(5)});`,
      [wishlistId, accountId, requestData.privacyLevel, requestData.title, currentTimestamp]
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

wishlistsRouter.get('/:wishlistId', async (req: Request, res: Response) => {
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
    interface WishlistDetails extends RowDataPacket {
      privacy_level: number;
      title: string;
      created_on_timestamp: number;
    }

    const [wishlistRows] = await dbPool.execute<WishlistDetails[]>(
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

    const wishlistDetails: WishlistDetails | undefined = wishlistRows[0];

    if (!wishlistDetails) {
      res.status(404).json({ message: 'Wishlist not found.', reason: 'wishlistNotFound' });
      return;
    }

    interface WishlistItem extends RowDataPacket {
      item_id: number;
      added_on_timestamp: number;
      title: string;
      description: string | null;
      link: string | null;
      tag_id: number;
      tag_name: string;
    }

    const [wishlistItems] = await dbPool.execute<WishlistItem[]>(
      `SELECT
        wishlist_items.item_id,
        wishlist_items.added_on_timestamp,
        wishlist_items.title,
        wishlist_items.description,
        wishlist_items.link,
        wishlist_item_tags.tag_id,
        wishlist_item_tags.tag_name
      FROM 
        wishlist_items
      LEFT JOIN
        wishlist_item_tags USING(item_id)
      WHERE
        wishlist_items.wishlist_id = ?;`,
      [wishlistId]
    );

    interface Tag {
      id: number;
      name: string;
    }

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

    const mappedWishlistItems: MappedWishlistItem[] = [];
    let currentItemId: number = 0;

    for (const item of wishlistItems) {
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
    newTitle: string;
  }

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['wishlistId', 'newTitle'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  if (!isValidUuid(requestData.wishlistId)) {
    res.status(400).json({ message: 'Invalid wishlist ID.', reason: 'invalidWishlistId' });
    return;
  }

  if (!isValidWishlistTitle(requestData.newTitle)) {
    res.status(400).json({ message: 'Invalid wishlist title.', reason: 'invalidTitle' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, res);

  if (!accountId) {
    return;
  }

  try {
    interface WishlistDetails extends RowDataPacket {
      title: string;
    }

    const [wishlistRows] = await dbPool.execute<WishlistDetails[]>(
      `SELECT
        title
      FROM
        wishlists
      WHERE
        wishlist_id = ? AND
        account_id = ?;`,
      [requestData.wishlistId, accountId]
    );

    const wishlistDetails: WishlistDetails | undefined = wishlistRows[0];

    if (!wishlistDetails) {
      res.status(404).json({ message: 'Wishlist not found.', reason: 'wishlistNotfound' });
      return;
    }

    if (wishlistDetails.title === requestData.newTitle) {
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
      [requestData.newTitle, requestData.wishlistId]
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
    newPrivacyLevel: number;
  }

  const requestData: RequestData = req.body;

  const expectedKeys: string[] = ['wishlistId', 'newPrivacyLevel'];
  if (undefinedValuesDetected(requestData, expectedKeys)) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  if (!isValidUuid(requestData.wishlistId)) {
    res.status(400).json({ message: 'Invalid wishlist ID.', reason: 'invalidWishlistId' });
    return;
  }

  if (!isValidWishlistPrivacyLevel(requestData.newPrivacyLevel)) {
    res.status(400).json({ message: 'Invalid privacy level.', reason: 'invalidPrivacyLevel' });
    return;
  }

  const accountId: number | null = await getAccountIdByAuthSessionId(authSessionId, res);

  if (!accountId) {
    return;
  }

  try {
    interface WishlistDetails extends RowDataPacket {
      privacy_level: number;
    }

    const [wishlistRows] = await dbPool.execute<WishlistDetails[]>(
      `SELECT
        privacy_level
      FROM
        wishlists
      WHERE
        wishlist_id = ? AND
        account_id = ?;`,
      [requestData.wishlistId, accountId]
    );

    const wishlistDetails: WishlistDetails | undefined = wishlistRows[0];

    if (!wishlistDetails) {
      res.status(404).json({ message: 'Wishlist not found.', reason: 'wishlistNotFound' });
      return;
    }

    if (wishlistDetails.privacy_level === requestData.newPrivacyLevel) {
      res.status(409).json({
        message: `Privacy level is already set to ${getWishlistPrivacyLevelName(wishlistDetails.privacy_level).toLocaleLowerCase()}.`,
        reason: 'identicalPrivacyLevel',
      });

      return;
    }

    const [resultSetHeader] = await dbPool.execute<ResultSetHeader>(
      `UPDATE
        wishlists
      SET
        privacy_level = ?
      WHERE
        wishlist_id = ?;`,
      [requestData.newPrivacyLevel, requestData.wishlistId]
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
