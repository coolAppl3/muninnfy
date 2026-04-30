import { describe, expect, it, vi } from 'vitest';
import axiosInstance from './axiosInstance';
import { getNotificationsBatchService } from './notificationServices';

vi.mock('./axiosInstance', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('getNotificationsBatchService', () => {
  it('should call get on the axios instance with the correct endpoint, offset, and an abort signal', async () => {
    const abortSignal: AbortSignal = new AbortController().signal;

    await getNotificationsBatchService(0, abortSignal);
    expect(axiosInstance.get).toHaveBeenCalledTimes(1);
    expect(axiosInstance.get).toHaveBeenCalledWith('/notifications/0', {
      signal: abortSignal,
    });
  });
});
