import { describe, expect, it, vi } from 'vitest';
import { dbPool } from '../db';
import { getWishlistItemByTitle } from './wishlistItemsDbHelpers';
import { mockReq } from '../../tests/setup';
import * as errorLogger from '../../logs/errorLogger';

vi.mock('../../logs/errorLogger');

describe('getWishlistItemByTitle', () => {
  it('should return null if the wishlist item is not found', async () => {
    vi.mocked(dbPool.execute).mockResolvedValueOnce([[], []]);

    const result = await getWishlistItemByTitle(
      'some title',
      '818db302-cec8-4fe1-84df-01e2aa505cb1',
      dbPool,
      mockReq
    );

    expect(result).toBeNull();
  });

  it('should return the wishlist item details if it is found', async () => {
    const wishlistItemDetails = {
      item_id: 1,
      added_on_timestamp: 1.772e12,
      title: 'some title',
      description: null,
      link: null,
      price: null,
      purchased_on_timestamp: null,
    };

    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          ...wishlistItemDetails,
          tag_id: 1,
          tag_name: 'someTag',
        } as any,
      ],
      [],
    ]);

    const result = await getWishlistItemByTitle(
      'some title',
      '818db302-cec8-4fe1-84df-01e2aa505cb1',
      dbPool,
      mockReq
    );

    expect(result).toStrictEqual({
      ...wishlistItemDetails,
      tags: [
        {
          id: 1,
          name: 'someTag',
        },
      ],
    });
  });

  it('should return null if an unexpected error is caught, logging it in the process', async () => {
    vi.mocked(dbPool.execute).mockRejectedValueOnce({});

    const result = await getWishlistItemByTitle(
      'some title',
      '818db302-cec8-4fe1-84df-01e2aa505cb1',
      dbPool,
      mockReq
    );

    expect(result).toBeNull();
    expect(errorLogger.logUnexpectedError).toHaveBeenCalledExactlyOnceWith(
      mockReq,
      {},
      'Failed to fetch wishlist item data.'
    );
  });
});
