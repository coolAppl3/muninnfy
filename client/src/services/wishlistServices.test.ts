import { describe, expect, it, vi } from 'vitest';
import axiosInstance from './axiosInstance';
import {
  changeWishlistPrivacyLevelService,
  changeWishlistTitleService,
  createWishlistAsAccountService,
  crossWishlistSearchService,
  deleteEmptyWishlistsService,
  deleteWishlistService,
  getAllViewWishlistsService,
  getAllWishlistsService,
  getViewWishlistDetailsService,
  getWishlistDetailsService,
  setWishlistFavoriteService,
  viewCrossWishlistSearchService,
} from './wishlistServices';

vi.mock('./axiosInstance', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockBody = { someValue: 23 };

describe('createWishlistAsAccountService', () => {
  it('should call post on the axios instance with the correct endpoint and body', async () => {
    await createWishlistAsAccountService(mockBody as any);
    expect(axiosInstance.post).toHaveBeenCalledTimes(1);
    expect(axiosInstance.post).toHaveBeenCalledWith('/wishlists', mockBody);
  });
});

describe('getWishlistDetailsService', () => {
  it('should call get on the axios instance with the correct endpoint, wishlist ID, and abort signal', async () => {
    const abortSignal: AbortSignal = new AbortController().signal;

    await getWishlistDetailsService('someWishlistId', abortSignal);
    expect(axiosInstance.get).toHaveBeenCalledTimes(1);
    expect(axiosInstance.get).toHaveBeenCalledWith('/wishlists/someWishlistId', {
      signal: abortSignal,
    });
  });
});

describe('getViewWishlistDetailsService', () => {
  it('should call get on the axios instance with the correct endpoint, wishlist ID, and abort signal', async () => {
    const abortSignal: AbortSignal = new AbortController().signal;

    await getViewWishlistDetailsService('someWishlistId', abortSignal);
    expect(axiosInstance.get).toHaveBeenCalledTimes(1);
    expect(axiosInstance.get).toHaveBeenCalledWith('/wishlists/view/someWishlistId', {
      signal: abortSignal,
    });
  });
});

describe('crossWishlistSearchService', () => {
  it('should call get on the axios instance with the correct endpoint and item title query', async () => {
    await crossWishlistSearchService('someItemTitleQuery');
    expect(axiosInstance.get).toHaveBeenCalledTimes(1);
    expect(axiosInstance.get).toHaveBeenCalledWith(
      '/wishlists/crossWishlistSearch/someItemTitleQuery'
    );
  });
});

describe('viewCrossWishlistSearchService', () => {
  it('should call get on the axios instance with the correct endpoint, item title query, and optional publicAccountId', async () => {
    await viewCrossWishlistSearchService('someItemTitleQuery', 'somePublicAccountId');
    expect(axiosInstance.get).toHaveBeenCalledTimes(1);
    expect(axiosInstance.get).toHaveBeenCalledWith('/wishlists/crossWishlistSearch', {
      params: { itemTitleQuery: 'someItemTitleQuery', publicAccountId: 'somePublicAccountId' },
    });
  });
});

describe('getAllWishlistsService', () => {
  it('should call get on the axios instance with the correct endpoint and an abort signal', async () => {
    const abortSignal: AbortSignal = new AbortController().signal;

    await getAllWishlistsService(abortSignal);
    expect(axiosInstance.get).toHaveBeenCalledTimes(1);
    expect(axiosInstance.get).toHaveBeenCalledWith('/wishlists/all', {
      signal: abortSignal,
    });
  });
});

describe('getAllViewWishlistsService', () => {
  it('should call get on the axios instance with the correct endpoint, publicAccountId, and an abort signal', async () => {
    const abortSignal: AbortSignal = new AbortController().signal;

    await getAllViewWishlistsService('somePublicAccountId', abortSignal);
    expect(axiosInstance.get).toHaveBeenCalledTimes(1);
    expect(axiosInstance.get).toHaveBeenCalledWith('/wishlists/view/all/somePublicAccountId', {
      signal: abortSignal,
    });
  });
});

describe('changeWishlistTitleService', () => {
  it('should call patch on the axios instance with the correct endpoint and body', async () => {
    await changeWishlistTitleService(mockBody as any);
    expect(axiosInstance.patch).toHaveBeenCalledTimes(1);
    expect(axiosInstance.patch).toHaveBeenCalledWith('/wishlists/change/title', mockBody);
  });
});

describe('changeWishlistPrivacyLevelService', () => {
  it('should call patch on the axios instance with the correct endpoint and body', async () => {
    await changeWishlistPrivacyLevelService(mockBody as any);
    expect(axiosInstance.patch).toHaveBeenCalledTimes(1);
    expect(axiosInstance.patch).toHaveBeenCalledWith(
      '/wishlists/change/privacyLevel',
      mockBody
    );
  });
});

describe('setWishlistFavoriteService', () => {
  it('should call patch on the axios instance with the correct endpoint and body', async () => {
    await setWishlistFavoriteService(mockBody as any);
    expect(axiosInstance.patch).toHaveBeenCalledTimes(1);
    expect(axiosInstance.patch).toHaveBeenCalledWith('/wishlists/change/favorite', mockBody);
  });
});

describe('deleteEmptyWishlistsService', () => {
  it('should call delete on the axios instance with the correct endpoint', async () => {
    await deleteEmptyWishlistsService();
    expect(axiosInstance.delete).toHaveBeenCalledTimes(1);
    expect(axiosInstance.delete).toHaveBeenCalledWith('/wishlists/empty');
  });
});

describe('deleteWishlistService', () => {
  it('should call delete on the axios instance with the correct endpoint and wishlist ID', async () => {
    await deleteWishlistService('someWishlistId');
    expect(axiosInstance.delete).toHaveBeenCalledTimes(1);
    expect(axiosInstance.delete).toHaveBeenCalledWith('/wishlists/someWishlistId');
  });
});
