import { describe, expect, it, vi } from 'vitest';
import { deleteWishlistItemTags, insertWishlistItemTags } from './wishlistItemTagsDbHelpers';
import { dbPool } from '../db';
import { mockReq } from '../../tests/setup';
import * as errorLogger from '../../logs/errorLogger';

vi.mock('../../logs/errorLogger');

describe('insertWishlistItemTags', () => {
  it('should insert wishlist item tags and return true if the operation is successful', async () => {
    vi.mocked(dbPool.query).mockResolvedValueOnce([{} as any, []]);
    const result = await insertWishlistItemTags([[1, 'someTag']], dbPool, mockReq);

    expect(result).toBe(true);
    expect(dbPool.query).toHaveBeenCalledExactlyOnceWith(
      `INSERT INTO wishlist_item_tags (
        item_id,
        tag_name
      ) VALUES ?;`,
      [[[1, 'someTag']]]
    );
  });

  it('should catch unexpected errors, log them, and return false', async () => {
    vi.mocked(dbPool.query).mockRejectedValueOnce({});
    const result = await insertWishlistItemTags([[1, 'someTag']], dbPool, mockReq);

    expect(result).toBe(false);
    expect(errorLogger.logUnexpectedError).toHaveBeenCalledExactlyOnceWith(
      mockReq,
      {},
      'Failed to insert tags.'
    );
  });
});

describe('deleteWishlistItemTags', () => {
  it('should delete the wishlist item tags and return true if the operation is successful', async () => {
    vi.mocked(dbPool.execute).mockResolvedValueOnce([{ affectedRows: 1 } as any, []]);
    const result = await deleteWishlistItemTags(1, dbPool, mockReq);

    expect(result).toBe(true);
    expect(dbPool.execute).toHaveBeenCalledExactlyOnceWith(
      `DELETE FROM
        wishlist_item_tags
      WHERE
        item_id = ?;`,
      [1]
    );
  });

  it('should catch unexpected errors, log them, and return false', async () => {
    vi.mocked(dbPool.execute).mockRejectedValueOnce({});
    const result = await deleteWishlistItemTags(1, dbPool, mockReq);

    expect(result).toBe(false);
    expect(errorLogger.logUnexpectedError).toHaveBeenCalledExactlyOnceWith(
      mockReq,
      {},
      'Failed to delete tags.'
    );
  });
});
