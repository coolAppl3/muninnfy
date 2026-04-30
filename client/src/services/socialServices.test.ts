import { describe, expect, it, vi } from 'vitest';
import axiosInstance from './axiosInstance';
import {
  acceptFollowRequestService,
  cancelFollowRequestService,
  declineFollowRequestService,
  findAccountsService,
  getAccountSocialDetailsService,
  getSocialBatchService,
  removeFollowerService,
  searchSocialService,
  sendFollowRequestService,
  unfollowService,
} from './socialServices';

vi.mock('./axiosInstance', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockBody = { someValue: 23 };

describe('getAccountSocialDetailsService', () => {
  it('should call get on the axios instance with the correct endpoint, an optional publicAccountId parameter, and an abort signal', async () => {
    const abortSignal: AbortSignal = new AbortController().signal;

    await getAccountSocialDetailsService(abortSignal, 'somePublicAccountId');
    expect(axiosInstance.get).toHaveBeenCalledTimes(1);
    expect(axiosInstance.get).toHaveBeenCalledWith('/social', {
      signal: abortSignal,
      params: { publicAccountId: 'somePublicAccountId' },
    });
  });
});

describe('getSocialBatchService', () => {
  it('should call get on the axios instance with the correct endpoint, a SocialSectionType, an offset, and an optional publicAccountId parameter', async () => {
    await getSocialBatchService('followers', 0, 'somePublicAccountId');
    expect(axiosInstance.get).toHaveBeenCalledTimes(1);
    expect(axiosInstance.get).toHaveBeenCalledWith('/social/followers', {
      params: { offset: 0, publicAccountId: 'somePublicAccountId' },
    });
  });
});

describe('searchSocialService', () => {
  it('should call get on the axios instance with the correct endpoint, a SocialSectionType, a search query, an offset, an abort signal, and an optional publicAccountId parameter', async () => {
    const abortSignal: AbortSignal = new AbortController().signal;

    await searchSocialService(
      'followers',
      'someSearchQuery',
      0,
      abortSignal,
      'somePublicAccountId'
    );
    expect(axiosInstance.get).toHaveBeenCalledTimes(1);
    expect(axiosInstance.get).toHaveBeenCalledWith('/social/followers/search', {
      signal: abortSignal,
      params: {
        searchQuery: 'someSearchQuery',
        offset: 0,
        publicAccountId: 'somePublicAccountId',
      },
    });
  });
});

describe('acceptFollowRequestService', () => {
  it('should call get on the axios instance with the correct endpoint and request body', async () => {
    await acceptFollowRequestService(mockBody as any);
    expect(axiosInstance.post).toHaveBeenCalledTimes(1);
    expect(axiosInstance.post).toHaveBeenCalledWith('/social/followRequests/accept', mockBody);
  });
});

describe('declineFollowRequestService', () => {
  it('should call delete on the axios instance with the correct endpoint and request body', async () => {
    await declineFollowRequestService(23);
    expect(axiosInstance.delete).toHaveBeenCalledTimes(1);
    expect(axiosInstance.delete).toHaveBeenCalledWith('/social/followRequests/decline/23');
  });
});

describe('sendFollowRequestService', () => {
  it('should call get on the axios instance with the correct endpoint and request body', async () => {
    await sendFollowRequestService(mockBody as any);
    expect(axiosInstance.post).toHaveBeenCalledTimes(1);
    expect(axiosInstance.post).toHaveBeenCalledWith('/social/followRequests/send', mockBody);
  });
});

describe('cancelFollowRequestService', () => {
  it('should call delete on the axios instance with the correct endpoint and request ID', async () => {
    await cancelFollowRequestService(23);
    expect(axiosInstance.delete).toHaveBeenCalledTimes(1);
    expect(axiosInstance.delete).toHaveBeenCalledWith('/social/followRequests/cancel/23');
  });
});

describe('unfollowService', () => {
  it('should call delete on the axios instance with the correct endpoint and follow ID', async () => {
    await unfollowService(23);
    expect(axiosInstance.delete).toHaveBeenCalledTimes(1);
    expect(axiosInstance.delete).toHaveBeenCalledWith('/social/followers/unfollow/23');
  });
});

describe('removeFollowerService', () => {
  it('should call delete on the axios instance with the correct endpoint and follow ID', async () => {
    await removeFollowerService(23);
    expect(axiosInstance.delete).toHaveBeenCalledTimes(1);
    expect(axiosInstance.delete).toHaveBeenCalledWith('/social/followers/remove/23');
  });
});

describe('findAccountsService', () => {
  it('should call get on the axios instance with the correct endpoint and a search query', async () => {
    await findAccountsService('someSearchQuery');
    expect(axiosInstance.get).toHaveBeenCalledTimes(1);
    expect(axiosInstance.get).toHaveBeenCalledWith('/social/find/someSearchQuery');
  });
});
