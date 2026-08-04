import { describe, expect, it, vi } from 'vitest';
import * as cookieUtils from '../util/cookieUtils';
import { getAuthSessionId } from './authUtils';
import { mockReq, mockRes } from '../tests/setup';

vi.mock('../util/cookieUtils');

describe('getAuthSessionId', () => {
  it('should call getRequestCookie', async () => {
    getAuthSessionId(mockReq, mockRes);

    expect(cookieUtils.getRequestCookie).toHaveBeenCalledExactlyOnceWith(
      mockReq,
      'authSessionId'
    );
  });

  it('should, if no authSessionId is cookie is found, reject the request if sendResponse is true and return null', async () => {
    const result = getAuthSessionId(mockReq, mockRes, true);

    expect(result).toBe(null);
    expect(mockRes.status).toHaveBeenCalledExactlyOnceWith(401);
    expect(mockRes.json).toHaveBeenCalledExactlyOnceWith({
      message: 'Sign in session expired.',
      reason: 'authSessionExpired',
    });
  });

  it('should, if an invalid authSessionId is provided, reject the request if sendResponse is true, return null, and call removeRequestCookie', async () => {
    vi.mocked(cookieUtils.getRequestCookie).mockReturnValueOnce('someInvalidAuthSessionId');
    const result = getAuthSessionId(mockReq, mockRes, true);

    expect(result).toBe(null);
    expect(mockRes.status).toHaveBeenCalledExactlyOnceWith(401);
    expect(mockRes.json).toHaveBeenCalledExactlyOnceWith({
      message: 'Sign in session expired.',
      reason: 'authSessionExpired',
    });
    expect(cookieUtils.removeRequestCookie).toHaveBeenCalledExactlyOnceWith(
      mockRes,
      'authSessionId'
    );
  });

  it('should return the authSessionId cookie if found', async () => {
    vi.mocked(cookieUtils.getRequestCookie).mockReturnValueOnce(
      '818db302-cec8-4fe1-84df-01e2aa505cb6'
    );
    const result = getAuthSessionId(mockReq, mockRes);

    expect(result).toBe('818db302-cec8-4fe1-84df-01e2aa505cb6');
  });
});
