import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { dbPool } from '../db/db';
import * as authDbHelpers from '../db/helpers/authDbHelpers';
import * as authUtils from '../auth/authUtils';
import * as socialDbHelpers from '../db/helpers/socialDbHelpers';
import * as errorLogger from '../logs/errorLogger';
import { FollowDetails, FollowRequest } from './socialRouter';
import { mockConnection } from '../tests/setup';
import {
  SOCIAL_MAX_FOLLOWERS_LIMIT,
  SOCIAL_MAX_FOLLOWING_LIMIT,
} from '../util/constants/socialConstants';
import * as notificationsDbHelpers from '../db/helpers/notificationsDbHelpers';

vi.mock('../db/helpers/authDbHelpers');
vi.mock('../db/helpers/socialDbHelpers', { spy: true });
vi.mock('../auth/authUtils', { spy: true });
vi.mock('../logs/errorLogger');
vi.mock('../db/helpers/notificationsDbHelpers');

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
    const follower: FollowDetails = {
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

describe('GET /followers', () => {
  function setEndpoint(offset: number = 0): string {
    return `/api/social/followers?offset=${offset}&publicAccountId=818db302-cec8-4fe1-84df-01e2aa505cb6`;
  }

  it('should reject the request if an invalid offset is provided', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(socialDbHelpers.getTargetAccountId).mockResolvedValueOnce(2);

    const res = await request(app)
      .get(setEndpoint(22.5))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid offset.',
      reason: 'invalidOffset',
    });
  });

  it('should resolve the request and return the data', async () => {
    const follower: FollowDetails = {
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
      .get(setEndpoint(0))
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
      .get(setEndpoint(0))
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

describe('GET /following/search', () => {
  function setEndpoint(searchQuery: string, offset: number = 0): string {
    return `/api/social/following/search?searchQuery=${searchQuery}&offset=${offset}&publicAccountId=818db302-cec8-4fe1-84df-01e2aa505cb6`;
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
    const following: FollowDetails = {
      follow_id: 1,
      follow_timestamp: 1.771e12,
      public_account_id: 'somePublicAccountId',
      username: 'johnDoe',
      display_name: 'John Doe',
    };

    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(socialDbHelpers.getTargetAccountId).mockResolvedValueOnce(2);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([[following as any], []]);

    const res = await request(app)
      .get(setEndpoint('someQuery'))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual([following]);
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

describe('GET /following', () => {
  function setEndpoint(offset: number = 0): string {
    return `/api/social/following?offset=${offset}&publicAccountId=818db302-cec8-4fe1-84df-01e2aa505cb6`;
  }

  it('should reject the request if an invalid offset is provided', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(socialDbHelpers.getTargetAccountId).mockResolvedValueOnce(2);

    const res = await request(app)
      .get(setEndpoint(22.5))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid offset.',
      reason: 'invalidOffset',
    });
  });

  it('should resolve the request and return the data', async () => {
    const following: FollowDetails = {
      follow_id: 1,
      follow_timestamp: 1.771e12,
      public_account_id: 'somePublicAccountId',
      username: 'johnDoe',
      display_name: 'John Doe',
    };

    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(socialDbHelpers.getTargetAccountId).mockResolvedValueOnce(2);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([[following as any], []]);

    const res = await request(app)
      .get(setEndpoint(0))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual([following]);
  });

  it('should reject the request if an unexpected error occurs and log it', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(socialDbHelpers.getTargetAccountId).mockResolvedValueOnce(2);

    const unexpectedError: Error = new Error('someUnexpectedError');

    vi.mocked(dbPool.execute).mockImplementationOnce(() => {
      throw unexpectedError;
    });

    const res = await request(app)
      .get(setEndpoint(0))
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

describe('GET /followRequests/search', () => {
  function setEndpoint(searchQuery: string, offset: number = 0): string {
    return `/api/social/followRequests/search?searchQuery=${searchQuery}&offset=${offset}`;
  }

  it('should reject the request if it does not contain an authSessionId cookie', async () => {
    const res = await request(app).get(setEndpoint('someSearchQuery'));

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Sign in session expired.',
      reason: 'authSessionExpired',
    });
  });

  it('should reject the request if it contains an invalid authSessionId cookie', async () => {
    const res = await request(app)
      .get(setEndpoint('someSearchQuery'))
      .set('Cookie', 'authSessionId=someInvalidAuthSessionId');

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Sign in session expired.',
      reason: 'authSessionExpired',
    });
  });

  it('should reject the request if an invalid search query is provided', async () => {
    const res = await request(app)
      .get(setEndpoint('!nval!d query'))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid search query.',
      reason: 'invalidSearchQuery',
    });
  });

  it('should reject the request if an invalid offset is provided', async () => {
    const res = await request(app)
      .get(setEndpoint('someSearchQuery', 22.5))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid offset.',
      reason: 'invalidOffset',
    });
  });

  it('should resolve the request and return an array of available follow requests', async () => {
    const followRequest: FollowRequest = {
      request_id: 1,
      request_timestamp: 1.771e12,
      public_account_id: 'somePublicAccountId',
      username: 'johnDoe',
      display_name: 'John Doe',
    };

    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([[followRequest as any], []]);

    const res = await request(app)
      .get(setEndpoint('someSearchQuery'))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual([followRequest]);
  });

  it('should reject the request if an unexpected error occurs and log it', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    const unexpectedError: Error = new Error('someUnexpectedError');

    vi.mocked(dbPool.execute).mockImplementationOnce(() => {
      throw unexpectedError;
    });

    const res = await request(app)
      .get(setEndpoint('someSearchQuery'))
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

describe('GET /followRequests', () => {
  function setEndpoint(offset: number = 0): string {
    return `/api/social/followRequests?offset=${offset}`;
  }

  it('should reject the request if it does not contain an authSessionId cookie', async () => {
    const res = await request(app).get(setEndpoint());

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Sign in session expired.',
      reason: 'authSessionExpired',
    });
  });

  it('should reject the request if it contains an invalid authSessionId cookie', async () => {
    const res = await request(app)
      .get(setEndpoint())
      .set('Cookie', 'authSessionId=someInvalidAuthSessionId');

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Sign in session expired.',
      reason: 'authSessionExpired',
    });
  });

  it('should reject the request if an invalid offset is provided', async () => {
    const res = await request(app)
      .get(setEndpoint(22.5))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid offset.',
      reason: 'invalidOffset',
    });
  });

  it('should resolve the request and return an array of available follow requests', async () => {
    const followRequest: FollowRequest = {
      request_id: 1,
      request_timestamp: 1.771e12,
      public_account_id: 'somePublicAccountId',
      username: 'johnDoe',
      display_name: 'John Doe',
    };

    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([[followRequest as any], []]);

    const res = await request(app)
      .get(setEndpoint())
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual([followRequest]);
  });

  it('should reject the request if an unexpected error occurs and log it', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    const unexpectedError: Error = new Error('someUnexpectedError');

    vi.mocked(dbPool.execute).mockImplementationOnce(() => {
      throw unexpectedError;
    });

    const res = await request(app)
      .get(setEndpoint())
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

describe('POST /followRequests/send', () => {
  const endpoint: string = '/api/social/followRequests/send';

  it('should reject the request if it does not contain an authSessionId cookie', async () => {
    const res = await request(app).post(endpoint).send({});

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Sign in session expired.',
      reason: 'authSessionExpired',
    });
  });

  it('should reject the request if it contains an invalid authSessionId cookie', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=someInvalidAuthSessionId')
      .send({});

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Sign in session expired.',
      reason: 'authSessionExpired',
    });
  });

  it('should reject the request if its body contains extra keys or does not contain all expected keys', async () => {
    const reqBody1 = {};
    const reqBody2 = { someOtherValue: 23 };
    const reqBody3 = {
      publicAccountId: '818db302-cec8-4fe1-84df-01e2aa505cb9',
      someOtherValue: 23,
    };

    const res1 = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send(reqBody1);

    const res2 = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send(reqBody2);

    const res3 = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send(reqBody3);

    expect(res1.status).toBe(400);
    expect(res2.status).toBe(400);
    expect(res3.status).toBe(400);

    expect(res1.body).toStrictEqual({ message: 'Invalid request data.' });
    expect(res2.body).toStrictEqual({ message: 'Invalid request data.' });
    expect(res3.body).toStrictEqual({ message: 'Invalid request data.' });
  });

  it('should reject the request if an invalid public account ID is provided', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        publicAccountId: 'someInvalidPublicAccountId',
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid account ID.',
      reason: 'invalidPublicAccountId',
    });
  });

  it('should request a connection, begin a transaction, and release it at the end', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        publicAccountId: '818db302-cec8-4fe1-84df-01e2aa505cb9',
      });

    expect(dbPool.getConnection).toHaveBeenCalledOnce();
    expect(mockConnection.beginTransaction).toHaveBeenCalledOnce();
    expect(mockConnection.release).toHaveBeenCalledOnce();
  });

  it('should reject the request if the requestee account is not found', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([[]]);

    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        publicAccountId: '818db302-cec8-4fe1-84df-01e2aa505cb9',
      });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Account not found or is unverified.',
      reason: 'accountNotFound',
    });
  });

  it('should reject the request if the requestee account is unverified', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          requestee_account_id: 2,
          requestee_is_verified: false,
          follow_requires_approval: false,

          follow_id: null,
          follow_request_id: null,

          requester_following_count: 1,
          requester_follow_requests_count: 1,
          requestee_followers_count: 1,
        },
      ],
    ]);

    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        publicAccountId: '818db302-cec8-4fe1-84df-01e2aa505cb9',
      });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Account not found or is unverified.',
      reason: 'accountNotFound',
    });
  });

  it('should reject the request if the the user attempts to send a follow request to themselves', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          requestee_account_id: 1,
          requestee_is_verified: true,
          follow_requires_approval: false,

          follow_id: null,
          follow_request_id: null,

          requester_following_count: 1,
          requester_follow_requests_count: 1,
          requestee_followers_count: 1,
        },
      ],
    ]);

    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        publicAccountId: '818db302-cec8-4fe1-84df-01e2aa505cb9',
      });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(409);
    expect(res.body).toStrictEqual({
      message: `Can't follow yourself.`,
      reason: 'selfFollow',
    });
  });

  it('should resolve the request if the requestee is already followed', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          requestee_account_id: 2,
          requestee_is_verified: true,
          follow_requires_approval: false,

          follow_id: 1,
          follow_request_id: null,

          requester_following_count: 1,
          requester_follow_requests_count: 1,
          requestee_followers_count: 1,
        },
      ],
    ]);

    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        publicAccountId: '818db302-cec8-4fe1-84df-01e2aa505cb9',
      });

    expect(mockConnection.commit).toHaveBeenCalledOnce();
    expect(res.status).toBe(201);
    expect(res.body).toStrictEqual({
      followAutoApproved: true,
      insertId: 1,
    });
  });

  it('should resolve the request if an existing follow request is found', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          requestee_account_id: 2,
          requestee_is_verified: true,
          follow_requires_approval: false,

          follow_id: null,
          follow_request_id: 1,

          requester_following_count: 1,
          requester_follow_requests_count: 1,
          requestee_followers_count: 1,
        },
      ],
    ]);

    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        publicAccountId: '818db302-cec8-4fe1-84df-01e2aa505cb9',
      });

    expect(mockConnection.commit).toHaveBeenCalledOnce();
    expect(res.status).toBe(201);
    expect(res.body).toStrictEqual({
      followAutoApproved: false,
      insertId: 1,
    });
  });

  it(`should reject the request if the sum of the requester's following and follow requests counts are equal to or greater than the following limit`, async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          requestee_account_id: 2,
          requestee_is_verified: true,
          follow_requires_approval: false,

          follow_id: null,
          follow_request_id: null,

          requester_following_count: SOCIAL_MAX_FOLLOWING_LIMIT / 2,
          requester_follow_requests_count: SOCIAL_MAX_FOLLOWING_LIMIT / 2,
          requestee_followers_count: 1,
        },
      ],
    ]);

    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        publicAccountId: '818db302-cec8-4fe1-84df-01e2aa505cb9',
      });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(409);
    expect(res.body).toStrictEqual({
      message: 'Following limit reached.',
      reason: 'followingLimitReached',
    });
  });

  it(`should reject the request if the requestee's followers count is equal to or greater than the followers limit`, async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          requestee_account_id: 2,
          requestee_is_verified: true,
          follow_requires_approval: false,

          follow_id: null,
          follow_request_id: null,

          requester_following_count: 1,
          requester_follow_requests_count: 1,
          requestee_followers_count: SOCIAL_MAX_FOLLOWERS_LIMIT,
        },
      ],
    ]);

    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        publicAccountId: '818db302-cec8-4fe1-84df-01e2aa505cb9',
      });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(409);
    expect(res.body).toStrictEqual({
      message: `User can't accept followers at this time.`,
      reason: 'requesteeFollowersLimitReached',
    });
  });

  it('should, if the requestee does not require follow approvals, resolve the request, follow them, and call addNotification', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          requestee_account_id: 2,
          requestee_is_verified: true,
          follow_requires_approval: false,

          follow_id: null,
          follow_request_id: null,

          requester_following_count: 1,
          requester_follow_requests_count: 1,
          requestee_followers_count: 1,
        },
      ],
    ]);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([{ insertId: 1 }]);

    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        publicAccountId: '818db302-cec8-4fe1-84df-01e2aa505cb9',
      });

    expect(mockConnection.commit).toHaveBeenCalledOnce();
    expect(res.status).toBe(201);
    expect(res.body).toStrictEqual({
      followAutoApproved: true,
      insertId: 1,
    });

    expect(notificationsDbHelpers.addNotification).toHaveBeenCalledExactlyOnceWith(
      2,
      1,
      expect.any(Number),
      'new_follower',
      1
    );
  });

  it('should resolve the request, send a follow request, and call addNotification', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          requestee_account_id: 2,
          requestee_is_verified: true,
          follow_requires_approval: true,

          follow_id: null,
          follow_request_id: null,

          requester_following_count: 1,
          requester_follow_requests_count: 1,
          requestee_followers_count: 1,
        },
      ],
    ]);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([{ insertId: 1 }]);

    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        publicAccountId: '818db302-cec8-4fe1-84df-01e2aa505cb9',
      });

    expect(mockConnection.commit).toHaveBeenCalledOnce();
    expect(res.status).toBe(201);
    expect(res.body).toStrictEqual({
      followAutoApproved: false,
      insertId: 1,
    });

    expect(notificationsDbHelpers.addNotification).toHaveBeenCalledExactlyOnceWith(
      2,
      1,
      expect.any(Number),
      'new_follow_request',
      1
    );
  });

  it('should reject the request if an unexpected error occurs and log it', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    const unexpectedError: Error = new Error('someUnexpectedError');

    vi.mocked(mockConnection.execute).mockImplementationOnce(() => {
      throw unexpectedError;
    });

    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        publicAccountId: '818db302-cec8-4fe1-84df-01e2aa505cb9',
      });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
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

describe('DELETE /followRequests/cancel/:requestId', () => {
  function setEndpoint(requestId: number): string {
    return `/api/social/followRequests/cancel/${requestId}`;
  }

  it('should reject the request if it does not contain an authSessionId cookie', async () => {
    const res = await request(app).delete(setEndpoint(22));

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Sign in session expired.',
      reason: 'authSessionExpired',
    });
  });

  it('should reject the request if it contains an invalid authSessionId cookie', async () => {
    const res = await request(app)
      .delete(setEndpoint(22))
      .set('Cookie', 'authSessionId=someInvalidAuthSessionId');

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Sign in session expired.',
      reason: 'authSessionExpired',
    });
  });

  it('should reject the request if an invalid request ID is provided', async () => {
    const res = await request(app)
      .delete(setEndpoint(22.5))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid request ID.',
      reason: 'invalidRequestId',
    });
  });

  it('should resolve the request if the follow request is not found', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([[], []]);

    const res = await request(app)
      .delete(setEndpoint(22))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({});
  });

  it(`should reject the request if a user attempts to delete another user's follow request, logging the event in the process`, async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          requester_account_id: 2,
          requestee_account_id: 3,
        } as any,
      ],
      [],
    ]);

    const res = await request(app)
      .delete(setEndpoint(22))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(500);
    expect(res.body).toStrictEqual({ message: 'Internal server error.' });

    expect(errorLogger.logUnexpectedError).toHaveBeenCalledExactlyOnceWith(
      expect.any(Object),
      null,
      `Attempt to delete another user's follow request detected.`
    );
  });

  it('should resolve the request if the follow request is found', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          requester_account_id: 1,
          requestee_account_id: 2,
        } as any,
      ],
      [],
    ]);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([[{ affectedRows: 1 } as any], []]);

    const res = await request(app)
      .delete(setEndpoint(22))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({});
  });

  it('should reject the request if an unexpected error occurs and log it', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    const unexpectedError: Error = new Error('someUnexpectedError');

    vi.mocked(dbPool.execute).mockImplementationOnce(() => {
      throw unexpectedError;
    });

    const res = await request(app)
      .delete(setEndpoint(22))
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

describe('POST /followRequests/accept', () => {
  const endpoint: string = '/api/social/followRequests/accept';

  it('should reject the request if it does not contain an authSessionId cookie', async () => {
    const res = await request(app).post(endpoint).send({});

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Sign in session expired.',
      reason: 'authSessionExpired',
    });
  });

  it('should reject the request if it contains an invalid authSessionId cookie', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=someInvalidAuthSessionId')
      .send({});

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Sign in session expired.',
      reason: 'authSessionExpired',
    });
  });

  it('should reject the request if its body contains extra keys or does not contain all expected keys', async () => {
    const reqBody1 = {};
    const reqBody2 = { someOtherValue: 23 };
    const reqBody3 = {
      requestId: 1,
      someOtherValue: 23,
    };

    const res1 = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send(reqBody1);

    const res2 = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send(reqBody2);

    const res3 = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send(reqBody3);

    expect(res1.status).toBe(400);
    expect(res2.status).toBe(400);
    expect(res3.status).toBe(400);

    expect(res1.body).toStrictEqual({ message: 'Invalid request data.' });
    expect(res2.body).toStrictEqual({ message: 'Invalid request data.' });
    expect(res3.body).toStrictEqual({ message: 'Invalid request data.' });
  });

  it('should reject the request if an invalid request ID is provided', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        requestId: 'invalidRequestId',
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid request ID.',
      reason: 'invalidRequestId',
    });
  });

  it('should request a connection, begin a transaction, and release it at the end', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        requestId: 1,
      });

    expect(dbPool.getConnection).toHaveBeenCalledOnce();
    expect(mockConnection.beginTransaction).toHaveBeenCalledOnce();
    expect(mockConnection.release).toHaveBeenCalledOnce();
  });

  it('should reject the request if the follow request is not found', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([[]]);

    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        requestId: 1,
      });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Follow request not found.',
      reason: 'requestNotFound',
    });
  });

  it('should reject the request if the user is already following the account in question, deleting the follow request in the process by calling deleteFollowRequest', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          requester_account_id: 2,
          followers_count: 1,
          requester_already_following: 1,
        },
      ],
    ]);
    vi.mocked(socialDbHelpers.deleteFollowRequest).mockResolvedValueOnce(true);

    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        requestId: 1,
      });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(409);
    expect(res.body).toStrictEqual({
      message: 'Request already accepted.',
      reason: 'alreadyAccepted',
    });

    expect(socialDbHelpers.deleteFollowRequest).toHaveBeenCalledExactlyOnceWith(
      1,
      dbPool,
      expect.any(Object)
    );
  });

  it('should reject the request if the user followers count has reached the limit', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          requester_account_id: 2,
          followers_count: SOCIAL_MAX_FOLLOWERS_LIMIT,
          requester_already_following: 0,
        },
      ],
    ]);

    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        requestId: 1,
      });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(409);
    expect(res.body).toStrictEqual({
      message: 'Followers limit reached.',
      reason: 'followersLimitReached',
    });
  });

  it('should resolve the request, create a followers row, and call deleteFollowRequest, returning the follow_id and follow_timestamp', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          requester_account_id: 2,
          followers_count: 1,
          requester_already_following: 0,
        },
      ],
    ]);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([{ insertId: 1 }]);
    vi.mocked(socialDbHelpers.deleteFollowRequest).mockResolvedValueOnce(true);

    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        requestId: 1,
      });

    expect(mockConnection.commit).toHaveBeenCalledOnce();
    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      follow_id: 1,
      follow_timestamp: expect.any(Number),
    });

    expect(socialDbHelpers.deleteFollowRequest).toHaveBeenCalledExactlyOnceWith(
      1,
      mockConnection,
      expect.any(Object)
    );
    expect(notificationsDbHelpers.addNotification).toHaveBeenCalledExactlyOnceWith(
      2,
      1,
      expect.any(Number),
      'follow_request_accepted',
      1
    );
  });

  it('should reject the request if an unexpected error occurs and log it', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    const unexpectedError: Error = new Error('someUnexpectedError');

    vi.mocked(mockConnection.execute).mockImplementationOnce(() => {
      throw unexpectedError;
    });

    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        requestId: 1,
      });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
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

describe('DELETE /followRequests/decline/:requestId', () => {
  function setEndpoint(requestId: number): string {
    return `/api/social/followRequests/decline/${requestId}`;
  }

  it('should reject the request if it does not contain an authSessionId cookie', async () => {
    const res = await request(app).delete(setEndpoint(22));

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Sign in session expired.',
      reason: 'authSessionExpired',
    });
  });

  it('should reject the request if it contains an invalid authSessionId cookie', async () => {
    const res = await request(app)
      .delete(setEndpoint(22))
      .set('Cookie', 'authSessionId=someInvalidAuthSessionId');

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Sign in session expired.',
      reason: 'authSessionExpired',
    });
  });

  it('should reject the request if an invalid request ID is provided', async () => {
    const res = await request(app)
      .delete(setEndpoint(22.5))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid request ID.',
      reason: 'invalidRequestId',
    });
  });

  it('should resolve the request and attempt to delete the follow_request row', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([[], []]);

    const res = await request(app)
      .delete(setEndpoint(22))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({});

    expect(dbPool.execute).toHaveBeenCalledExactlyOnceWith(
      `DELETE FROM
          follow_requests
        WHERE
          request_id = ? AND
          requestee_account_id = ?;`,
      [22, 1]
    );
  });

  it('should reject the request if an unexpected error occurs and log it', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    const unexpectedError: Error = new Error('someUnexpectedError');

    vi.mocked(dbPool.execute).mockImplementationOnce(() => {
      throw unexpectedError;
    });

    const res = await request(app)
      .delete(setEndpoint(22))
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
