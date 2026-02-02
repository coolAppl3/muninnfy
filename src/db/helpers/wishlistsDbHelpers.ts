import { Request } from 'express';
import { Pool, PoolConnection, ResultSetHeader } from 'mysql2/promise';
import { logUnexpectedError } from '../../logs/errorLogger';
import { WISHLIST_INTERACTION_THROTTLE_WINDOW, WISHLIST_INTERACTIVITY_MAX_VALUE } from '../../util/constants/wishlistConstants';

export async function incrementWishlistInteractivityIndex(
  wishlistId: string,
  increment: number,
  executor: Pool | PoolConnection,
  req: Request
): Promise<void> {
  const currentTimestamp: number = Date.now();

  try {
    const [resultSetHeader] = await executor.execute<ResultSetHeader>(
      `UPDATE
        wishlists
      SET
        interactivity_index = LEAST(:maximumInteractivityValue, (
          CASE
            WHEN :currentTimestamp - latest_interaction_timestamp < :throttleWindow
              THEN interactivity_index + (:increment / 2)
            ELSE
              interactivity_index + :increment
          END
        )),
        latest_interaction_timestamp = :currentTimestamp
      WHERE
        wishlist_id = :wishlistId;`,
      {
        currentTimestamp,
        increment,
        wishlistId,
        throttleWindow: WISHLIST_INTERACTION_THROTTLE_WINDOW,
        maximumInteractivityValue: WISHLIST_INTERACTIVITY_MAX_VALUE,
      }
    );

    if (resultSetHeader.affectedRows === 0) {
      await logUnexpectedError(req, null, 'Failed to increment interactivity_index.');
    }
  } catch (err: unknown) {
    console.log(err);
    await logUnexpectedError(req, err, 'Failed to increment interactivity_index.');
  }
}
