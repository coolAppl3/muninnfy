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
    expect(axiosInstance.post).toHaveBeenCalledOnce();
    expect(axiosInstance.post).toHaveBeenCalledExactlyOnceWith('/wishlistItems', mockBody);
  });
});

describe('editWishlistItemService', () => {
  it('should call patch on the axios instance with the correct endpoint and body', async () => {
    await editWishlistItemService(mockBody as any);
    expect(axiosInstance.patch).toHaveBeenCalledOnce();
    expect(axiosInstance.patch).toHaveBeenCalledExactlyOnceWith('/wishlistItems', mockBody);
  });
});

describe('deleteWishlistItemService', () => {
  it('should call delete on the axios instance with the correct endpoint, wishlist ID, and item ID as parameters', async () => {
    await deleteWishlistItemService('someWishlistId', 23);
    expect(axiosInstance.delete).toHaveBeenCalledOnce();
    expect(axiosInstance.delete).toHaveBeenCalledExactlyOnceWith('/wishlistItems', {
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
    expect(axiosInstance.delete).toHaveBeenCalledOnce();
    expect(axiosInstance.delete).toHaveBeenCalledExactlyOnceWith('/wishlistItems/bulk', {
      data: mockBody,
    });
  });
});

describe('setWishlistItemIsPurchasedService', () => {
  it('should call patch on the axios instance with the correct endpoint and body', async () => {
    await setWishlistItemIsPurchasedService(mockBody as any);
    expect(axiosInstance.patch).toHaveBeenCalledOnce();
    expect(axiosInstance.patch).toHaveBeenCalledExactlyOnceWith(
      '/wishlistItems/purchaseStatus',
      mockBody
    );
  });
});

describe('bulkSetWishlistItemIsPurchasedService', () => {
  it('should call patch on the axios instance with the correct endpoint and body', async () => {
    await bulkSetWishlistItemIsPurchasedService(mockBody as any);
    expect(axiosInstance.patch).toHaveBeenCalledOnce();
    expect(axiosInstance.patch).toHaveBeenCalledExactlyOnceWith(
      '/wishlistItems/purchaseStatus/bulk',
      mockBody
    );
  });
});
