import { describe, expect, it, vi } from 'vitest';
import { Response } from 'express';
import { mockConnection } from '../tests/setup';
import { PoolConnection } from 'mysql2/promise';
import * as cookieUtils from '../util/cookieUtils';
import { createAuthSession } from './authSessions';

vi.mock('../util/cookieUtils');
vi.mock('../util/sqlUtils/isSqlError');

describe('createAuthSession', () => {
  it('should return false if a 4th attempt is tried', async () => {
    const result = await createAuthSession(
      {} as Response,
      mockConnection as unknown as PoolConnection,
      1,
      false,
      4
    );

    expect(result).toBe(false);
  });

  it('should, if less than 3 auth sessions are found, create a new one, call setResponseCookie, and return true', async () => {
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([[]]);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([{}]);

    const result = await createAuthSession(
      {} as Response,
      mockConnection as unknown as PoolConnection,
      1,
      false,
      1
    );

    expect(result).toBe(true);
    expect(cookieUtils.setResponseCookie).toHaveBeenCalledExactlyOnceWith(
      expect.any(Object),
      'authSessionId',
      expect.any(String),
      undefined,
      true
    );
  });

  it('should, if 3 or more auth sessions are found, adjust the oldest one, call setResponseCookie, and return true', async () => {
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          session_id: '818db302-cec8-4fe1-84df-01e2aa505cb1',
          created_on_timestamp: 1.771e12,
        },
        {
          session_id: '818db302-cec8-4fe1-84df-01e2aa505cb2',
          created_on_timestamp: 1.772e12,
        },
        {
          session_id: '818db302-cec8-4fe1-84df-01e2aa505cb3',
          created_on_timestamp: 1.773e12,
        },
      ],
    ]);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([{ affectedRows: 1 }]);

    const result = await createAuthSession(
      {} as Response,
      mockConnection as unknown as PoolConnection,
      1,
      false,
      1
    );

    expect(result).toBe(true);
    expect(cookieUtils.setResponseCookie).toHaveBeenCalledExactlyOnceWith(
      expect.any(Object),
      'authSessionId',
      expect.any(String),
      undefined,
      true
    );
  });
});
