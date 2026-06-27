import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { dbPool } from '../db/db';
import * as authDbHelpers from '../db/helpers/authDbHelpers';
import * as authUtils from '../auth/authUtils';
import * as socialDbHelpers from '../db/helpers/socialDbHelpers';
import * as errorLogger from '../logs/errorLogger';

vi.mock('../db/helpers/authDbHelpers');
vi.mock('../db/helpers/socialDbHelpers', { spy: true });
vi.mock('../auth/authUtils', { spy: true });
vi.mock('../logs/errorLogger');

describe('GET /', () => {
  function setEndpoint(publicAccountId: string): string {
    return `/api/social${publicAccountId ? `?publicAccountId=${publicAccountId}` : ''}`;
  }

  it('should always call getAuthSessionId and getAccountIdByAuthSessionId', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    await request(app)
      .get(setEndpoint(''))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(authUtils.getAuthSessionId).toHaveBeenCalledExactlyOnceWith(
      expect.any(Object),
      expect.any(Object),
      false
    );
    expect(authDbHelpers.getAccountIdByAuthSessionId).toHaveBeenCalledExactlyOnceWith(
      '818db302-cec8-4fe1-84df-01e2aa505cb6',
      expect.any(Object),
      expect.any(Object),
      false
    );
  });

  it('should reject the request if the user is not signed in and no public account ID is provided in the query string', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(null);

    const res = await request(app)
      .get(setEndpoint(''))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Sign in session expired.',
      reason: 'authSessionExpired',
    });
  });

  it('should reject the request if an invalid public account ID is provided in the query string', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(null);

    const res = await request(app)
      .get(setEndpoint('someInvalidPublicAccountId'))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Account not found.',
      reason: 'accountNotFound',
    });
  });

  it('should reject the request the request no account is found with the public account ID provided', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(null);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([[], []]);

    const res = await request(app)
      .get(setEndpoint('818db302-cec8-4fe1-84df-01e2aa505cb6'))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Account not found.',
      reason: 'accountNotFound',
    });
  });

  it('should reject the request if the account found using the public account ID is private and the requester is not a follower', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          target_account_id: 2,
          is_private: true,
          is_following: false,
        } as any,
      ],
      [],
    ]);

    const res = await request(app)
      .get(setEndpoint('818db302-cec8-4fe1-84df-01e2aa505cb6'))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Account is private.',
      reason: 'privateAccount',
    });
  });

  it('should resolve the request and return the social data', async () => {
    const socialData = {
      socialCounts: {
        followers_count: 1,
        following_count: 1,
        follow_requests_count: 0,
      },
      followers: [
        {
          follow_id: 1,
          follow_timestamp: 1.771e12,
          public_account_id: 'somePublicAccountId',
          username: 'johnDoe',
          display_name: 'John Doe',
        },
      ],
      following: [
        {
          follow_id: 2,
          follow_timestamp: 1.771e12,
          public_account_id: 'someOtherPublicAccountId',
          username: 'saraSmith',
          display_name: 'Sara Smith',
        },
      ],
      followRequests: [],
    };

    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          target_account_id: 2,
          is_private: false,
          is_following: true,
        } as any,
      ],
      [],
    ]);
    vi.mocked(dbPool.query).mockResolvedValueOnce([
      [
        [socialData.socialCounts] as any,
        socialData.followers as any,
        socialData.following as any,
        socialData.followRequests as any,
      ],
      [],
    ]);

    const res = await request(app)
      .get(setEndpoint('818db302-cec8-4fe1-84df-01e2aa505cb6'))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual(socialData);
  });

  it('should reject the request if an unexpected error occurs and log it', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(socialDbHelpers.getTargetAccountId).mockResolvedValueOnce(2);

    const unexpectedError: Error = new Error('someUnexpectedError');

    vi.mocked(dbPool.query).mockImplementationOnce(() => {
      throw unexpectedError;
    });

    const res = await request(app)
      .get(setEndpoint('818db302-cec8-4fe1-84df-01e2aa505cb6'))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(500);
    expect(res.body).toStrictEqual({
      message: 'Internal server error.',
    });

    expect(errorLogger.logUnexpectedError).toHaveBeenCalledExactlyOnceWith(
      expect.any(Object),
      unexpectedError
    );
  });
});

describe('GET /followers/search', () => {
  function setEndpoint(searchQuery: string, offset: number = 0): string {
    return `/api/social/followers/search?searchQuery=${searchQuery}&offset=${offset}&publicAccountId=818db302-cec8-4fe1-84df-01e2aa505cb6`;
  }

  it('should reject the request if an invalid search query is provided', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(socialDbHelpers.getTargetAccountId).mockResolvedValueOnce(2);

    const res = await request(app)
      .get(setEndpoint(''))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid search query.',
      reason: 'invalidSearchQuery',
    });
  });

  it('should reject the request if an invalid offset is provided', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(socialDbHelpers.getTargetAccountId).mockResolvedValueOnce(2);

    const res = await request(app)
      .get(setEndpoint('someQuery', 22.5))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid offset.',
      reason: 'invalidOffset',
    });
  });

  it('should resolve the request and return the data', async () => {
    const follower = {
      follow_id: 1,
      follow_timestamp: 1.771e12,
      public_account_id: 'somePublicAccountId',
      username: 'johnDoe',
      display_name: 'John Doe',
    };

    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(socialDbHelpers.getTargetAccountId).mockResolvedValueOnce(2);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([[follower as any], []]);

    const res = await request(app)
      .get(setEndpoint('someQuery'))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual([follower]);
  });

  it('should reject the request if an unexpected error occurs and log it', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(socialDbHelpers.getTargetAccountId).mockResolvedValueOnce(2);

    const unexpectedError: Error = new Error('someUnexpectedError');

    vi.mocked(dbPool.execute).mockImplementationOnce(() => {
      throw unexpectedError;
    });

    const res = await request(app)
      .get(setEndpoint('someQuery'))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(500);
    expect(res.body).toStrictEqual({
      message: 'Internal server error.',
    });

    expect(errorLogger.logUnexpectedError).toHaveBeenCalledExactlyOnceWith(
      expect.any(Object),
      unexpectedError
    );
  });
});
