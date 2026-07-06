import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { dbPool } from '../db/db';
import * as authDbHelpers from '../db/helpers/authDbHelpers';
import * as errorLogger from '../logs/errorLogger';
import { mockConnection } from '../tests/setup';
import {
  PRIVATE_WISHLIST_PRIVACY_LEVEL,
  TOTAL_WISHLISTS_LIMIT,
} from '../util/constants/wishlistConstants';
import * as isSqlError from '../util/sqlUtils/isSqlError';

vi.mock('../db/helpers/authDbHelpers');
vi.mock('../logs/errorLogger');
vi.mock('../util/sqlUtils/isSqlError');

describe('POST /', () => {
  const endpoint: string = '/api/wishlists';

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
      privacyLevel: PRIVATE_WISHLIST_PRIVACY_LEVEL,
      title: 'some title',

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

  it('should reject the request if an invalid privacy level is provided', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        privacyLevel: -1,
        title: 'some title',
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid privacy level.',
      reason: 'invalidPrivacyLevel',
    });
  });

  it('should reject the request if an invalid title is provided', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        privacyLevel: PRIVATE_WISHLIST_PRIVACY_LEVEL,
        title: 'invalid   title',
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid title.',
      reason: 'invalidTitle',
    });
  });

  it('should request a connection, begin a transaction, and release it at the end', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        privacyLevel: PRIVATE_WISHLIST_PRIVACY_LEVEL,
        title: 'some title',
      });

    expect(dbPool.getConnection).toHaveBeenCalledOnce();
    expect(mockConnection.beginTransaction).toHaveBeenCalledOnce();
    expect(mockConnection.release).toHaveBeenCalledOnce();
  });

  it('should reject the request if wishlists count limit has been reached', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          wishlists_created_count: TOTAL_WISHLISTS_LIMIT,
        },
      ],
    ]);

    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        privacyLevel: PRIVATE_WISHLIST_PRIVACY_LEVEL,
        title: 'some title',
      });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(403);
    expect(res.body).toStrictEqual({
      message: 'Wishlists limit reached.',
      reason: 'wishlistsLimitReached',
    });
  });

  it('should create a new wishlist and return its ID', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          wishlists_created_count: 1,
        },
      ],
    ]);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([]);

    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        privacyLevel: PRIVATE_WISHLIST_PRIVACY_LEVEL,
        title: 'some title',
      });

    expect(mockConnection.commit).toHaveBeenCalledOnce();
    expect(res.status).toBe(201);
    expect(res.body).toStrictEqual({
      wishlistId: expect.any(String),
    });
  });

  it('should reject the request if an unexpected error occurs and log it', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    const unexpectedError: Error = new Error('someUnexpectedError');
    vi.mocked(mockConnection.execute).mockRejectedValueOnce(unexpectedError);

    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        privacyLevel: PRIVATE_WISHLIST_PRIVACY_LEVEL,
        title: 'some title',
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

  it('should reject the request if the title is already used by another wishlist', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(isSqlError.isSqlError).mockReturnValueOnce(true);

    const unexpectedError = {
      errno: 1062,
      sqlMessage: `Duplicate entry for key 'account_id'`,
    };
    vi.mocked(mockConnection.execute).mockRejectedValueOnce(unexpectedError);

    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        privacyLevel: PRIVATE_WISHLIST_PRIVACY_LEVEL,
        title: 'some title',
      });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(409);
    expect(res.body).toStrictEqual({
      message: 'You already have a wishlist with this title.',
      reason: 'duplicateTitle',
    });
  });
});

describe('GET /crossWishlistSearch/:itemTitleQuery', () => {
  function setEndpoint(itemTitleQuery: string): string {
    return `/api/wishlists/crossWishlistSearch/${itemTitleQuery}`;
  }

  it('should reject the request if it does not contain an authSessionId cookie', async () => {
    const res = await request(app).get(setEndpoint('some title'));

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Sign in session expired.',
      reason: 'authSessionExpired',
    });
  });

  it('should reject the request if it contains an invalid authSessionId cookie', async () => {
    const res = await request(app)
      .get(setEndpoint('some title'))
      .set('Cookie', 'authSessionId=someInvalidAuthSessionId');

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Sign in session expired.',
      reason: 'authSessionExpired',
    });
  });

  it('should reject the request if an invalid item title is provided', async () => {
    const res = await request(app)
      .get(setEndpoint('invalid    title'))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid search query.',
      reason: 'invalidQuery',
    });
  });

  it('should resolve the request and return the results', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          wishlist_id: 'someWishlistId',
        },
        {
          wishlist_id: 'someOtherWishlistId',
        },
      ] as any,
      [],
    ]);

    const res = await request(app)
      .get(setEndpoint('egg'))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual(['someWishlistId', 'someOtherWishlistId']);
  });

  // --

  it('should reject the request if an unexpected error occurs and log it', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    const unexpectedError: Error = new Error('someUnexpectedError');
    vi.mocked(dbPool.execute).mockRejectedValueOnce(unexpectedError);

    const res = await request(app)
      .get(setEndpoint('some title'))
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
