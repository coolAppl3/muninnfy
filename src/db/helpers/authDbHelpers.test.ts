import { describe, expect, it, vi } from 'vitest';
import * as cookieUtils from '../../util/cookieUtils';
import { dbPool } from '../db';
import { getAccountIdByAuthSessionId } from './authDbHelpers';
import { mockReq, mockRes } from '../../tests/setup';
import { hourMilliseconds } from '../../util/constants/globalConstants';

vi.mock('../../util/cookieUtils');

describe('getAccountIdByAuthSessionId', () => {
  it('should reject the request and return null if the auth session is not found, calling removeRequestCookie in the process', async () => {
    vi.mocked(dbPool.execute).mockResolvedValueOnce([[], []]);

    const result = await getAccountIdByAuthSessionId(
      '818db302-cec8-4fe1-84df-01e2aa505cb6',
      mockReq,
      mockRes
    );

    expect(result).toBeNull();
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

  it('should reject the request and return null if the auth session is expired, calling removeRequestCookie in the process', async () => {
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          account_id: 1,
          expiry_timestamp: 1.772e12,
        } as any,
      ],
      [],
    ]);

    const result = await getAccountIdByAuthSessionId(
      '818db302-cec8-4fe1-84df-01e2aa505cb6',
      mockReq,
      mockRes
    );

    expect(result).toBeNull();
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

  it('should reject the request and return the account ID if a valid auth session is found', async () => {
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          account_id: 1,
          expiry_timestamp: Date.now() + hourMilliseconds,
        } as any,
      ],
      [],
    ]);

    const result = await getAccountIdByAuthSessionId(
      '818db302-cec8-4fe1-84df-01e2aa505cb6',
      mockReq,
      mockRes
    );

    expect(result).toBe(1);
  });

  it('should reject the request and return null if an unexpected error is caught, logging the error in the process', async () => {
    vi.mocked(dbPool.execute).mockRejectedValueOnce({});

    const result = await getAccountIdByAuthSessionId(
      '818db302-cec8-4fe1-84df-01e2aa505cb6',
      mockReq,
      mockRes
    );

    expect(result).toBeNull();
    expect(mockRes.status).toHaveBeenCalledExactlyOnceWith(500);
    expect(mockRes.json).toHaveBeenCalledExactlyOnceWith({ message: 'Internal server error.' });
  });
});
