import { describe, expect, it, vi } from 'vitest';
import { checkForAuthSessionService, signOutService } from './authServices';
import axiosInstance from './axiosInstance';

vi.mock('./axiosInstance', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('checkForAuthSessionService', () => {
  it('should call get on the axios instance with the correct endpoint and an abort signal', async () => {
    const abortSignal: AbortSignal = new AbortController().signal;

    await checkForAuthSessionService(abortSignal);
    expect(axiosInstance.get).toHaveBeenCalledOnce();
    expect(axiosInstance.get).toHaveBeenCalledWith('/auth/session', {
      signal: abortSignal,
    });
  });
});

describe('signOutService', () => {
  it('should call delete on the axios instance with the correct endpoint', async () => {
    await signOutService();
    expect(axiosInstance.delete).toHaveBeenCalledOnce();
    expect(axiosInstance.delete).toHaveBeenCalledWith('/auth/session');
  });
});
