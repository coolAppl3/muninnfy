import { Request } from 'express';
import { Pool, PoolConnection, ResultSetHeader } from 'mysql2/promise';
import { logUnexpectedError } from '../../logs/errorLogger';

export async function insertWishlistItemTags(
  sanitizedTags: [number, string][],
  executor: Pool | PoolConnection,
  req: Request
): Promise<boolean> {
  try {
    await executor.query<ResultSetHeader>(
      `INSERT INTO wishlist_item_tags (
        item_id,
        tag_name
      ) VALUES ?;`,
      [sanitizedTags]
    );

    return true;
  } catch (err: unknown) {
    console.log(err);
    await logUnexpectedError(req, err, 'Failed to insert tags.');

    return false;
  }
}

export async function deleteWishlistItemTags(itemId: number, executor: Pool | PoolConnection, req: Request): Promise<boolean> {
  try {
    await executor.execute<ResultSetHeader>(
      `DELETE FROM
        wishlist_item_tags
      WHERE
        item_id = ?;`,
      [itemId]
    );

    return true;
  } catch (err: unknown) {
    console.log(err);
    await logUnexpectedError(req, err, 'Failed to delete tags.');

    return false;
  }
}
