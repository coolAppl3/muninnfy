import { describe, expect, it, vi } from 'vitest';
import { deleteFollowRequest, getTargetAccountId } from './socialDbHelpers';
import { dbPool } from '../db';
import { mockReq, mockRes } from '../../tests/setup';
import * as errorLogger from '../../logs/errorLogger';
import { Request } from 'express';
import * as cookieUtils from '../../util/cookieUtils';

vi.mock('../../logs/errorLogger');
vi.mock('../../util/cookieUtils');

describe('deleteFollowRequest', () => {
  it('should attempt to delete the follow_requests row and return a boolean as to whether the operation was successful', async () => {
    vi.mocked(dbPool.execute).mockResolvedValueOnce([{ affectedRows: 1 } as any, []]);

    const result = await deleteFollowRequest(1, dbPool, mockReq);

    expect(result).toBe(true);
    expect(dbPool.execute).toHaveBeenCalledExactlyOnceWith(
      `DELETE FROM
        follow_requests
      WHERE
        request_id = ?;`,
      [1]
    );
  });

  it('should catch and unexpected error and log it', async () => {
    vi.mocked(dbPool.execute).mockRejectedValueOnce({});

    const result = await deleteFollowRequest(1, dbPool, mockReq);

    expect(result).toBe(false);
    expect(errorLogger.logUnexpectedError).toHaveBeenCalledExactlyOnceWith(
      mockReq,
      {},
      'Failed to delete follow request.'
    );
  });
});

describe('deleteFollowRequest', () => {
  function getMockReq(publicAccountId: any): Request {
    return {
      query: {
        publicAccountId,
      },
    } as unknown as Request;
  }

  it('should return the accountId parameter if one is provided but no publicAccountId is found', async () => {
    const result = await getTargetAccountId(1, getMockReq(undefined), mockRes);
    expect(result).toBe(1);
  });

  it('should reject the request, call removeRequestCookie, and return null if the accountId parameter is null and no publicAccountId is found', async () => {
    const result = await getTargetAccountId(null, getMockReq(undefined), mockRes);

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

  it('should reject the request and return null if and invalid publicAccountId is provided', async () => {
    const result = await getTargetAccountId(
      1,
      getMockReq('someInvalidPublicAccountID'),
      mockRes
    );

    expect(result).toBeNull();
    expect(mockRes.status).toHaveBeenCalledExactlyOnceWith(404);
    expect(mockRes.json).toHaveBeenCalledExactlyOnceWith({
      message: 'Account not found.',
      reason: 'accountNotFound',
    });
  });

  it('should reject the request and return null if the account is not found', async () => {
    vi.mocked(dbPool.execute).mockResolvedValueOnce([[], []]);

    const result = await getTargetAccountId(
      1,
      getMockReq('818db302-cec8-4fe1-84df-01e2aa505cb6'),
      mockRes
    );

    expect(result).toBeNull();
    expect(mockRes.status).toHaveBeenCalledExactlyOnceWith(404);
    expect(mockRes.json).toHaveBeenCalledExactlyOnceWith({
      message: 'Account not found.',
      reason: 'accountNotFound',
    });
  });

  it('should reject the request and return null if the account is private and the requester is not a follower', async () => {
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          target_account_id: 2,
          is_private: true,
          is_following: 0,
        } as any,
      ],
      [],
    ]);

    const result = await getTargetAccountId(
      1,
      getMockReq('818db302-cec8-4fe1-84df-01e2aa505cb6'),
      mockRes
    );

    expect(result).toBeNull();
    expect(mockRes.status).toHaveBeenCalledExactlyOnceWith(401);
    expect(mockRes.json).toHaveBeenCalledExactlyOnceWith({
      message: 'Account is private.',
      reason: 'privateAccount',
    });
  });

  it('should return the target_account_id if an account is found and no privacy settings are blocking the request', async () => {
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          target_account_id: 2,
          is_private: false,
          is_following: 0,
        } as any,
      ],
      [],
    ]);

    const result = await getTargetAccountId(
      1,
      getMockReq('818db302-cec8-4fe1-84df-01e2aa505cb6'),
      mockRes
    );

    expect(result).toBe(2);
  });

  it('should reject the request and return null if the account is private and the requester is not a follower', async () => {
    vi.mocked(dbPool.execute).mockRejectedValueOnce({});

    const result = await getTargetAccountId(
      1,
      getMockReq('818db302-cec8-4fe1-84df-01e2aa505cb6'),
      mockRes
    );

    expect(result).toBeNull();
    expect(mockRes.status).toHaveBeenCalledExactlyOnceWith(500);
    expect(mockRes.json).toHaveBeenCalledExactlyOnceWith({ message: 'Internal server error.' });
    expect(errorLogger.logUnexpectedError).toHaveBeenCalledExactlyOnceWith(
      getMockReq('818db302-cec8-4fe1-84df-01e2aa505cb6'),
      {}
    );
  });
});
