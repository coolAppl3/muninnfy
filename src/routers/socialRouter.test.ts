import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { dbPool } from '../db/db';
import * as authDbHelpers from '../db/helpers/authDbHelpers';
import * as authUtils from '../auth/authUtils';

vi.mock('../db/helpers/authDbHelpers');
vi.mock('../auth/authUtils', { spy: true });

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
});
