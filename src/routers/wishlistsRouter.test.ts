import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { dbPool } from '../db/db';
import * as authDbHelpers from '../db/helpers/authDbHelpers';
import * as errorLogger from '../logs/errorLogger';
import { mockConnection } from '../tests/setup';
import {
  FOLLOWERS_WISHLIST_PRIVACY_LEVEL,
  PRIVATE_WISHLIST_PRIVACY_LEVEL,
  PUBLIC_WISHLIST_PRIVACY_LEVEL,
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

describe('GET /crossWishlistSearch', () => {
  function setEndpoint(itemTitleQuery: string, publicAccountId: string): string {
    return `/api/wishlists/crossWishlistSearch?itemTitleQuery=${itemTitleQuery}&publicAccountId=${publicAccountId}`;
  }

  it('should reject the request if an invalid public account ID is provided', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    const res = await request(app)
      .get(setEndpoint('invalid   title', '818db302-cec8-4fe1-84df-01e2aa505cb6'))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid search query.',
      reason: 'invalidQuery',
    });
  });

  it('should reject the request if an invalid public account ID is provided', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    const res = await request(app)
      .get(setEndpoint('some title', 'someInvalidPublicAccountId'))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Account not found.',
      reason: 'accountNotFound',
    });
  });

  it('should reject the request if the account is not found', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([[], []]);

    const res = await request(app)
      .get(setEndpoint('egg', '818db302-cec8-4fe1-84df-01e2aa505cb6'))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Account not found.',
      reason: 'accountNotFound',
    });
  });

  it('should resolve the request and return the results', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          target_account_id: 2,
          is_following: 0,
        } as any,
      ],
      [],
    ]);
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
      .get(setEndpoint('some title', '818db302-cec8-4fe1-84df-01e2aa505cb6'))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual(['someWishlistId', 'someOtherWishlistId']);
  });

  it('should reject the request if an unexpected error occurs and log it', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    const unexpectedError: Error = new Error('someUnexpectedError');
    vi.mocked(dbPool.execute).mockRejectedValueOnce(unexpectedError);

    const res = await request(app)
      .get(setEndpoint('some title', '818db302-cec8-4fe1-84df-01e2aa505cb9'))
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

describe('GET /all', () => {
  const endpoint: string = '/api/wishlists/all';

  it('should reject the request if it does not contain an authSessionId cookie', async () => {
    const res = await request(app).get(endpoint);

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Sign in session expired.',
      reason: 'authSessionExpired',
    });
  });

  it('should reject the request if it contains an invalid authSessionId cookie', async () => {
    const res = await request(app)
      .get(endpoint)
      .set('Cookie', 'authSessionId=someInvalidAuthSessionId');

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Sign in session expired.',
      reason: 'authSessionExpired',
    });
  });

  it('should resolve the request and return the data', async () => {
    const wishlists = [
      {
        wishlist_id: 'someWishlistId',
        privacy_level: PRIVATE_WISHLIST_PRIVACY_LEVEL,
        title: 'some title',
        created_on_timestamp: 1.771e12,
        is_favorited: true,
        interactivity_index: 30,
        latest_interaction_timestamp: 1.773e12,
        items_count: 3,
        purchased_items_count: 1,
        total_items_price: 1200,
        price_to_complete: 800,
      },
      {
        wishlist_id: 'someOtherWishlistId',
        privacy_level: FOLLOWERS_WISHLIST_PRIVACY_LEVEL,
        title: 'some other title',
        created_on_timestamp: 1.772e12,
        is_favorited: false,
        interactivity_index: 40,
        latest_interaction_timestamp: 1.773e12,
        items_count: 2,
        purchased_items_count: 0,
        total_items_price: 1000,
        price_to_complete: 1000,
      },
    ];

    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([wishlists as any, []]);

    const res = await request(app)
      .get(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      combinedWishlistsStatistics: {
        totalItemsCount: 5,
        totalPurchasedItemsCount: 1,
        totalWishlistsWorth: 2200,
        totalWishlistsSpent: 400,
        totalWishlistsToComplete: 1800,
      },
      wishlists,
    });
  });

  it('should reject the request if an unexpected error occurs and log it', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    const unexpectedError: Error = new Error('someUnexpectedError');
    vi.mocked(dbPool.execute).mockRejectedValueOnce(unexpectedError);

    const res = await request(app)
      .get(endpoint)
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

describe('GET /:wishlistId', () => {
  function setEndpoint(wishlistId: string): string {
    return `/api/wishlists/${wishlistId}`;
  }

  it('should reject the request if it does not contain an authSessionId cookie', async () => {
    const res = await request(app).get(setEndpoint('818db302-cec8-4fe1-84df-01e2aa505cb1'));

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Sign in session expired.',
      reason: 'authSessionExpired',
    });
  });

  it('should reject the request if it contains an invalid authSessionId cookie', async () => {
    const res = await request(app)
      .get(setEndpoint('818db302-cec8-4fe1-84df-01e2aa505cb1'))
      .set('Cookie', 'authSessionId=someInvalidAuthSessionId');

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Sign in session expired.',
      reason: 'authSessionExpired',
    });
  });

  it('should reject the request if an invalid wishlist ID is provided', async () => {
    const res = await request(app)
      .get(setEndpoint('someInvalidWishlistId'))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid wishlist ID.',
      reason: 'invalidWishlistId',
    });
  });

  it('should reject the request if the wishlist is not found', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([[], []]);

    const res = await request(app)
      .get(setEndpoint('818db302-cec8-4fe1-84df-01e2aa505cb1'))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Wishlist not found.',
      reason: 'wishlistNotFound',
    });
  });

  it('should resolve the request and return the data', async () => {
    const wishlistDetails = {
      privacy_level: PRIVATE_WISHLIST_PRIVACY_LEVEL,
      title: 'some title',
      created_on_timestamp: 1.772e12,
      is_favorited: false,
    };

    const wishlistItem = {
      item_id: 1,
      added_on_timestamp: 1.771e12,
      title: 'some item',
      description: 'some description',
      link: null,
      price: null,
      purchased_on_timestamp: null,

      tag_id: 1,
      tag_name: 'someTag',
    };

    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([[wishlistDetails as any], []]);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([[wishlistItem] as any, []]);

    const res = await request(app)
      .get(setEndpoint('818db302-cec8-4fe1-84df-01e2aa505cb1'))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    const { tag_id, tag_name, ...rest } = wishlistItem;

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      wishlistDetails,
      wishlistItems: [
        {
          ...rest,
          tags: [
            {
              id: tag_id,
              name: tag_name,
            },
          ],
        },
      ],
    });
  });

  it('should reject the request if an unexpected error occurs and log it', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    const unexpectedError: Error = new Error('someUnexpectedError');
    vi.mocked(dbPool.execute).mockRejectedValueOnce(unexpectedError);

    const res = await request(app)
      .get(setEndpoint('818db302-cec8-4fe1-84df-01e2aa505cb1'))
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

describe('PATCH /change/title', () => {
  const endpoint: string = '/api/wishlists/change/title';

  it('should reject the request if it does not contain an authSessionId cookie', async () => {
    const res = await request(app).patch(endpoint).send({});

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Sign in session expired.',
      reason: 'authSessionExpired',
    });
  });

  it('should reject the request if it contains an invalid authSessionId cookie', async () => {
    const res = await request(app)
      .patch(endpoint)
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
      wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
      newTitle: 'some new title',

      someOtherValue: 23,
    };

    const res1 = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send(reqBody1);

    const res2 = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send(reqBody2);

    const res3 = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send(reqBody3);

    expect(res1.status).toBe(400);
    expect(res2.status).toBe(400);
    expect(res3.status).toBe(400);

    expect(res1.body).toStrictEqual({ message: 'Invalid request data.' });
    expect(res2.body).toStrictEqual({ message: 'Invalid request data.' });
    expect(res3.body).toStrictEqual({ message: 'Invalid request data.' });
  });

  it('should reject the request if an invalid wishlist ID is provided', async () => {
    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: 'someInvalidWishlistId',
        newTitle: 'some new title',
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid wishlist ID.',
      reason: 'invalidWishlistId',
    });
  });

  it('should reject the request if an invalid new title is provided', async () => {
    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        newTitle: 'invalid   title',
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid wishlist title.',
      reason: 'invalidTitle',
    });
  });

  it('should reject the request if the wishlist is not found', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([[], []]);

    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        newTitle: 'some new title',
      });

    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Wishlist not found.',
      reason: 'wishlistNotFound',
    });
  });

  it('should reject the request if the new title is already set for the wishlist', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          title: 'some new title',
          new_title_used_elsewhere: 0,
        } as any,
      ],
      [],
    ]);

    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        newTitle: 'some new title',
      });

    expect(res.status).toBe(409);
    expect(res.body).toStrictEqual({
      message: 'Wishlist already has this title.',
      reason: 'identicalTitle',
    });
  });

  it('should reject the request if the new title is already in use by another wishlist', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          title: 'some title',
          new_title_used_elsewhere: 1,
        } as any,
      ],
      [],
    ]);

    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        newTitle: 'some new title',
      });

    expect(res.status).toBe(409);
    expect(res.body).toStrictEqual({
      message: 'You already have a wishlist with this title.',
      reason: 'duplicateTitle',
    });
  });

  it('should resolve the request and update the wishlist title', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          title: 'some title',
          new_title_used_elsewhere: 0,
        } as any,
      ],
      [],
    ]);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([{ affectedRows: 1 } as any, []]);

    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        newTitle: 'some new title',
      });

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({});
  });

  it('should reject the request if an unexpected error occurs and log it', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    const unexpectedError: Error = new Error('someUnexpectedError');
    vi.mocked(dbPool.execute).mockRejectedValueOnce(unexpectedError);

    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        newTitle: 'some new title',
      });

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
    vi.mocked(dbPool.execute).mockRejectedValueOnce(unexpectedError);

    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        newTitle: 'some new title',
      });

    expect(res.status).toBe(409);
    expect(res.body).toStrictEqual({
      message: 'You already have a wishlist with this title.',
      reason: 'duplicateTitle',
    });
  });
});

describe('PATCH /change/privacyLevel', () => {
  const endpoint: string = '/api/wishlists/change/privacyLevel';

  it('should reject the request if it does not contain an authSessionId cookie', async () => {
    const res = await request(app).patch(endpoint).send({});

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Sign in session expired.',
      reason: 'authSessionExpired',
    });
  });

  it('should reject the request if it contains an invalid authSessionId cookie', async () => {
    const res = await request(app)
      .patch(endpoint)
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
      wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
      newPrivacyLevel: FOLLOWERS_WISHLIST_PRIVACY_LEVEL,

      someOtherValue: 23,
    };

    const res1 = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send(reqBody1);

    const res2 = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send(reqBody2);

    const res3 = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send(reqBody3);

    expect(res1.status).toBe(400);
    expect(res2.status).toBe(400);
    expect(res3.status).toBe(400);

    expect(res1.body).toStrictEqual({ message: 'Invalid request data.' });
    expect(res2.body).toStrictEqual({ message: 'Invalid request data.' });
    expect(res3.body).toStrictEqual({ message: 'Invalid request data.' });
  });

  it('should reject the request if an invalid wishlist ID is provided', async () => {
    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: 'someInvalidWishlistId',
        newPrivacyLevel: FOLLOWERS_WISHLIST_PRIVACY_LEVEL,
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid wishlist ID.',
      reason: 'invalidWishlistId',
    });
  });

  it('should reject the request if an invalid new privacy level is provided', async () => {
    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        newPrivacyLevel: -1,
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid privacy level.',
      reason: 'invalidPrivacyLevel',
    });
  });

  it('should reject the request if the wishlist is not found', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([[], []]);

    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        newPrivacyLevel: FOLLOWERS_WISHLIST_PRIVACY_LEVEL,
      });

    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Wishlist not found.',
      reason: 'wishlistNotFound',
    });
  });

  it('should resolve the request if the wishlist already has the requested privacy level', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          privacy_level: FOLLOWERS_WISHLIST_PRIVACY_LEVEL,
        } as any,
      ],
      [],
    ]);

    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        newPrivacyLevel: FOLLOWERS_WISHLIST_PRIVACY_LEVEL,
      });

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({});
  });

  it('should resolve the request and update the privacy level', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          privacy_level: PRIVATE_WISHLIST_PRIVACY_LEVEL,
        } as any,
      ],
      [],
    ]);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([{ affectedRows: 1 } as any, []]);

    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        newPrivacyLevel: FOLLOWERS_WISHLIST_PRIVACY_LEVEL,
      });

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({});
  });

  it('should reject the request if an unexpected error occurs and log it', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    const unexpectedError: Error = new Error('someUnexpectedError');
    vi.mocked(dbPool.execute).mockRejectedValueOnce(unexpectedError);

    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        newPrivacyLevel: FOLLOWERS_WISHLIST_PRIVACY_LEVEL,
      });

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

describe('PATCH /change/favorite', () => {
  const endpoint: string = '/api/wishlists/change/favorite';

  it('should reject the request if it does not contain an authSessionId cookie', async () => {
    const res = await request(app).patch(endpoint).send({});

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Sign in session expired.',
      reason: 'authSessionExpired',
    });
  });

  it('should reject the request if it contains an invalid authSessionId cookie', async () => {
    const res = await request(app)
      .patch(endpoint)
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
      wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
      newIsFavorited: true,

      someOtherValue: 23,
    };

    const res1 = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send(reqBody1);

    const res2 = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send(reqBody2);

    const res3 = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send(reqBody3);

    expect(res1.status).toBe(400);
    expect(res2.status).toBe(400);
    expect(res3.status).toBe(400);

    expect(res1.body).toStrictEqual({ message: 'Invalid request data.' });
    expect(res2.body).toStrictEqual({ message: 'Invalid request data.' });
    expect(res3.body).toStrictEqual({ message: 'Invalid request data.' });
  });

  it('should reject the request if an invalid wishlist ID is provided', async () => {
    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: 'someInvalidWishlistId',
        newIsFavorited: true,
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid wishlist ID.',
      reason: 'invalidWishlistId',
    });
  });

  it('should reject the request if an invalid favorite value is provided', async () => {
    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        newIsFavorited: 23,
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid favorite value.',
      reason: 'invalidFavoriteValue',
    });
  });

  it('should reject the request if the wishlist is not found', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([[], []]);

    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        newIsFavorited: true,
      });

    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Wishlist not found.',
      reason: 'wishlistNotFound',
    });
  });

  it('should resolve the request if the wishlist already has the favorite value requested', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          is_favorited: true,
        } as any,
      ],
      [],
    ]);

    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        newIsFavorited: true,
      });

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({});
  });

  it('should resolve the request and update the favorite value', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          is_favorited: true,
        } as any,
      ],
      [],
    ]);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([{ affectedRows: 1 } as any, []]);

    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        newIsFavorited: false,
      });

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({});
  });

  it('should reject the request if an unexpected error occurs and log it', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    const unexpectedError: Error = new Error('someUnexpectedError');
    vi.mocked(dbPool.execute).mockRejectedValueOnce(unexpectedError);

    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        newIsFavorited: true,
      });

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

describe('DELETE /empty', () => {
  const endpoint: string = '/api/wishlists/empty';

  it('should reject the request if it does not contain an authSessionId cookie', async () => {
    const res = await request(app).delete(endpoint);

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Sign in session expired.',
      reason: 'authSessionExpired',
    });
  });

  it('should reject the request if it contains an invalid authSessionId cookie', async () => {
    const res = await request(app)
      .delete(endpoint)
      .set('Cookie', 'authSessionId=someInvalidAuthSessionId');

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Sign in session expired.',
      reason: 'authSessionExpired',
    });
  });

  it('should resolve the request and delete any empty wishlists', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([{ affectedRows: 1 } as any, []]);

    const res = await request(app)
      .delete(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({});

    expect(dbPool.execute).toHaveBeenCalledExactlyOnceWith(
      `DELETE FROM
        wishlists
      WHERE
        account_id = ? AND
        NOT EXISTS (
          SELECT 1 FROM wishlist_items WHERE wishlist_items.wishlist_id = wishlists.wishlist_id
        )
      LIMIT ?;`,
      [1, TOTAL_WISHLISTS_LIMIT]
    );
  });

  it('should reject the request if an unexpected error occurs and log it', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    const unexpectedError: Error = new Error('someUnexpectedError');
    vi.mocked(dbPool.execute).mockRejectedValueOnce(unexpectedError);

    const res = await request(app)
      .delete(endpoint)
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

describe('DELETE /:wishlistId', () => {
  function setEndpoint(wishlistId: string): string {
    return `/api/wishlists/${wishlistId}`;
  }

  it('should reject the request if it does not contain an authSessionId cookie', async () => {
    const res = await request(app).delete(setEndpoint('818db302-cec8-4fe1-84df-01e2aa505cb1'));

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Sign in session expired.',
      reason: 'authSessionExpired',
    });
  });

  it('should reject the request if it contains an invalid authSessionId cookie', async () => {
    const res = await request(app)
      .delete(setEndpoint('818db302-cec8-4fe1-84df-01e2aa505cb1'))
      .set('Cookie', 'authSessionId=someInvalidAuthSessionId');

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Sign in session expired.',
      reason: 'authSessionExpired',
    });
  });

  it('should reject the request if an invalid wishlist ID is provided', async () => {
    const res = await request(app)
      .delete(setEndpoint('someInvalidWishlistId'))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid wishlist ID.',
      reason: 'invalidWishlistId',
    });
  });

  it('should reject the request if the wishlist is not found', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([[], []]);

    const res = await request(app)
      .delete(setEndpoint('818db302-cec8-4fe1-84df-01e2aa505cb1'))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Wishlist not found.',
      reason: 'wishlistNotFound',
    });
  });

  it('should resolve the request and delete the wishlist', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          1: 1,
        } as any,
      ],
      [],
    ]);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([{ affectedRows: 1 } as any, []]);

    const res = await request(app)
      .delete(setEndpoint('818db302-cec8-4fe1-84df-01e2aa505cb1'))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({});
  });

  it('should reject the request if an unexpected error occurs and log it', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    const unexpectedError: Error = new Error('someUnexpectedError');
    vi.mocked(dbPool.execute).mockRejectedValueOnce(unexpectedError);

    const res = await request(app)
      .delete(setEndpoint('818db302-cec8-4fe1-84df-01e2aa505cb1'))
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

describe('GET /view/:wishlistId', () => {
  function setEndpoint(wishlistId: string): string {
    return `/api/wishlists/view/${wishlistId}`;
  }

  it('should reject the request if an invalid wishlist ID is provided', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    const res = await request(app)
      .get(setEndpoint('someInvalidWishlistId'))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid wishlist ID.',
      reason: 'invalidWishlistId',
    });
  });

  it('should reject the request if the wishlist is not found', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([[], []]);

    const res = await request(app)
      .get(setEndpoint('818db302-cec8-4fe1-84df-01e2aa505cb1'))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Wishlist not found.',
      reason: 'wishlistNotFound',
    });
  });

  it('should reject the request if made by the wishlist owner', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          account_id: 1,
          privacy_level: PUBLIC_WISHLIST_PRIVACY_LEVEL,
          title: 'some title',
          created_on_timestamp: 1.771e12,

          owner_public_account_id: 'somePublicAccountId',
          owner_username: 'johnDoe',
          owner_display_name: 'John Doe',

          is_follower: false,
        } as any,
      ],
      [],
    ]);

    const res = await request(app)
      .get(setEndpoint('818db302-cec8-4fe1-84df-01e2aa505cb1'))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(409);
    expect(res.body).toStrictEqual({
      message: 'Wishlist owner.',
      reason: 'wishlistOwner',
    });
  });

  it('should reject the request if the wishlist is private', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          account_id: 2,
          privacy_level: PRIVATE_WISHLIST_PRIVACY_LEVEL,
          title: 'some title',
          created_on_timestamp: 1.771e12,

          owner_public_account_id: 'somePublicAccountId',
          owner_username: 'johnDoe',
          owner_display_name: 'John Doe',

          is_follower: false,
        } as any,
      ],
      [],
    ]);

    const res = await request(app)
      .get(setEndpoint('818db302-cec8-4fe1-84df-01e2aa505cb1'))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Wishlist not found.',
      reason: 'wishlistNotFound',
    });
  });

  it('should reject the request if the wishlist is only visible to followers and the user is not a follower', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          account_id: 2,
          privacy_level: FOLLOWERS_WISHLIST_PRIVACY_LEVEL,
          title: 'some title',
          created_on_timestamp: 1.771e12,

          owner_public_account_id: 'somePublicAccountId',
          owner_username: 'johnDoe',
          owner_display_name: 'John Doe',

          is_follower: false,
        } as any,
      ],
      [],
    ]);

    const res = await request(app)
      .get(setEndpoint('818db302-cec8-4fe1-84df-01e2aa505cb1'))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Wishlist not found.',
      reason: 'wishlistNotFound',
    });
  });

  it('should resolve the request and return the data', async () => {
    const wishlistItem = {
      item_id: 1,
      added_on_timestamp: 1.771e12,
      title: 'some item',
      description: 'some description',
      link: null,
      price: null,
      purchased_on_timestamp: null,

      tag_id: 1,
      tag_name: 'someTag',
    };

    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          account_id: 2,
          privacy_level: FOLLOWERS_WISHLIST_PRIVACY_LEVEL,
          title: 'some title',
          created_on_timestamp: 1.771e12,

          owner_public_account_id: 'somePublicAccountId',
          owner_username: 'johnDoe',
          owner_display_name: 'John Doe',

          is_follower: true,
        } as any,
      ],
      [],
    ]);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([[wishlistItem as any], []]);

    const res = await request(app)
      .get(setEndpoint('818db302-cec8-4fe1-84df-01e2aa505cb1'))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    const { tag_id, tag_name, ...rest } = wishlistItem;

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      viewWishlistDetails: {
        title: 'some title',
        created_on_timestamp: 1.771e12,
      },
      wishlistItems: [
        {
          ...rest,
          tags: [
            {
              id: tag_id,
              name: tag_name,
            },
          ],
        },
      ],
      ownerDetails: {
        owner_public_account_id: 'somePublicAccountId',
        owner_username: 'johnDoe',
        owner_display_name: 'John Doe',
      },
    });
  });

  it('should reject the request if an unexpected error occurs and log it', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    const unexpectedError: Error = new Error('someUnexpectedError');
    vi.mocked(dbPool.execute).mockRejectedValueOnce(unexpectedError);

    const res = await request(app)
      .get(setEndpoint('818db302-cec8-4fe1-84df-01e2aa505cb1'))
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

describe('GET /view/all/:publicAccountId', () => {
  function setEndpoint(publicAccountId: string): string {
    return `/api/wishlists/view/all/${publicAccountId}`;
  }

  it('should reject the request if an invalid public account ID is provided', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    const res = await request(app)
      .get(setEndpoint('someInvalidPublicAccount'))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Account not found.',
      reason: 'accountNotFound',
    });
  });

  it('should reject the request if the account is not found', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([[], []]);

    const res = await request(app)
      .get(setEndpoint('818db302-cec8-4fe1-84df-01e2aa505cb9'))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Account not found.',
      reason: 'accountNotFound',
    });
  });

  it('should reject the request if if made by the account owner', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          target_account_id: 1,
          owner_username: 'johnDoe',
          owner_display_name: 'John Doe',
          is_following: 0,
        } as any,
      ],
      [],
    ]);

    const res = await request(app)
      .get(setEndpoint('818db302-cec8-4fe1-84df-01e2aa505cb9'))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(409);
    expect(res.body).toStrictEqual({
      message: 'Account owner.',
      reason: 'accountOwner',
    });
  });

  it('should resolve the request and return the user wishlists', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          target_account_id: 2,
          owner_username: 'johnDoe',
          owner_display_name: 'John Doe',
          is_following: 0,
        } as any,
      ],
      [],
    ]);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          wishlist_id: '818db302-cec8-4fe1-84df-01e2aa505cb1',
          title: 'some title',
          created_on_timestamp: 1.772e12,

          items_count: 1,
          purchased_items_count: 0,
          total_items_price: 100,
          price_to_complete: 100,
        } as any,
      ],
      [],
    ]);

    const res = await request(app)
      .get(setEndpoint('818db302-cec8-4fe1-84df-01e2aa505cb9'))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      ownerDetails: {
        owner_username: 'johnDoe',
        owner_display_name: 'John Doe',
      },
      wishlists: [
        {
          wishlist_id: '818db302-cec8-4fe1-84df-01e2aa505cb1',
          title: 'some title',
          created_on_timestamp: 1.772e12,

          items_count: 1,
          purchased_items_count: 0,
          total_items_price: 100,
          price_to_complete: 100,
        },
      ],
      combinedWishlistsStatistics: {
        totalItemsCount: 1,
        totalPurchasedItemsCount: 0,
        totalWishlistsWorth: 100,
        totalWishlistsSpent: 0,
        totalWishlistsToComplete: 100,
      },
    });
  });

  it('should reject the request if an unexpected error occurs and log it', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    const unexpectedError: Error = new Error('someUnexpectedError');
    vi.mocked(dbPool.execute).mockRejectedValueOnce(unexpectedError);

    const res = await request(app)
      .get(setEndpoint('818db302-cec8-4fe1-84df-01e2aa505cb1'))
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
