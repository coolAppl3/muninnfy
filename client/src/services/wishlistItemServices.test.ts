import { describe, expect, it, vi } from 'vitest';
import axiosInstance from './axiosInstance';
import {
  addWishlistItemService,
  bulkDeleteWishlistItemsService,
  bulkSetWishlistItemIsPurchasedService,
  deleteWishlistItemService,
  editWishlistItemService,
  setWishlistItemIsPurchasedService,
} from './wishlistItemServices';

vi.mock('./axiosInstance', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockBody = { someValue: 23 };

describe('addWishlistItemService', () => {
  it('should call post on the axios instance with the correct endpoint and body', async () => {
    await addWishlistItemService(mockBody as any);
    expect(axiosInstance.post).toHaveBeenCalledTimes(1);
    expect(axiosInstance.post).toHaveBeenCalledWith('/wishlistItems', mockBody);
  });
});

describe('editWishlistItemService', () => {
  it('should call patch on the axios instance with the correct endpoint and body', async () => {
    await editWishlistItemService(mockBody as any);
    expect(axiosInstance.patch).toHaveBeenCalledTimes(1);
    expect(axiosInstance.patch).toHaveBeenCalledWith('/wishlistItems', mockBody);
  });
});

describe('deleteWishlistItemService', () => {
  it('should call delete on the axios instance with the correct endpoint, wishlist ID, and item ID as parameters', async () => {
    await deleteWishlistItemService('someWishlistId', 23);
    expect(axiosInstance.delete).toHaveBeenCalledTimes(1);
    expect(axiosInstance.delete).toHaveBeenCalledWith('/wishlistItems', {
      params: {
        wishlistId: 'someWishlistId',
        itemId: 23,
      },
    });
  });
});

describe('bulkDeleteWishlistItemsService', () => {
  it('should call delete on the axios instance with the correct endpoint and body', async () => {
    await bulkDeleteWishlistItemsService(mockBody as any);
    expect(axiosInstance.delete).toHaveBeenCalledTimes(1);
    expect(axiosInstance.delete).toHaveBeenCalledWith('/wishlistItems/bulk', {
      data: mockBody,
    });
  });
});

describe('setWishlistItemIsPurchasedService', () => {
  it('should call patch on the axios instance with the correct endpoint and body', async () => {
    await setWishlistItemIsPurchasedService(mockBody as any);
    expect(axiosInstance.patch).toHaveBeenCalledTimes(1);
    expect(axiosInstance.patch).toHaveBeenCalledWith('/wishlistItems/purchaseStatus', mockBody);
  });
});

describe('bulkSetWishlistItemIsPurchasedService', () => {
  it('should call patch on the axios instance with the correct endpoint and body', async () => {
    await bulkSetWishlistItemIsPurchasedService(mockBody as any);
    expect(axiosInstance.patch).toHaveBeenCalledTimes(1);
    expect(axiosInstance.patch).toHaveBeenCalledWith(
      '/wishlistItems/purchaseStatus/bulk',
      mockBody
    );
  });
});
