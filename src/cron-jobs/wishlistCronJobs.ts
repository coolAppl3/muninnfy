import { dbPool } from '../db/db';
import { WISHLIST_INTERACTIVITY_DECAY_AMOUNT, WISHLIST_INTERACTIVITY_DECAY_GRACE_PERIOD } from '../util/constants/wishlistConstants';

export async function decayWishlistsInteractivityIndexCron(currentTimestamp: number): Promise<void> {
  try {
    await dbPool.execute(
      `UPDATE
        wishlists
      SET
        interactivity_index = GREATEST(interactivity_index - :decayAmount, 0)
      WHERE
        :currentTimestamp - created_on_timestamp >= :decayGracePeriod;`,
      { decayAmount: WISHLIST_INTERACTIVITY_DECAY_AMOUNT, currentTimestamp, decayGracePeriod: WISHLIST_INTERACTIVITY_DECAY_GRACE_PERIOD }
    );
  } catch (err: unknown) {
    console.log(err);
  }
}
