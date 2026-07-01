import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { dbPool } from '../db/db';
import * as authDbHelpers from '../db/helpers/authDbHelpers';
import * as errorLogger from '../logs/errorLogger';
import { mockConnection } from '../tests/setup';
import {
  WISHLIST_INTERACTION_ADD_ITEM,
  WISHLIST_INTERACTION_BULK_SMALL,
  WISHLIST_INTERACTION_GENERAL,
  WISHLIST_ITEMS_LIMIT,
} from '../util/constants/wishlistConstants';
import * as wishlistItemTagsDbHelpers from '../db/helpers/wishlistItemTagsDbHelpers';
import * as wishlistsDbHelpers from '../db/helpers/wishlistsDbHelpers';
import { sanitizeWishlistItemTags } from '../util/validation/wishlistItemTagValidation';
import * as isSqlError from '../util/sqlUtils/isSqlError';
import * as wishlistItemsDbHelpers from '../db/helpers/wishlistItemsDbHelpers';
import { MappedWishlistItem } from './wishlistItemsRouter';

vi.mock('../db/helpers/authDbHelpers');
vi.mock('../logs/errorLogger');
vi.mock('../db/helpers/wishlistItemTagsDbHelpers');
vi.mock('../db/helpers/wishlistsDbHelpers');
vi.mock('../util/sqlUtils/isSqlError');
vi.mock('../db/helpers/wishlistItemsDbHelpers');

describe('POST /', () => {
  const endpoint: string = '/api/wishlistItems';

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
      wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
      title: 'some title',
      description: 'some description',
      link: 'https://example.com',
      price: 22,
      tags: ['someTag'],

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

  it('should reject the request if an invalid wishlist ID is provided', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: 'someInvalidWishlistId',
        title: 'some title',
        description: 'some description',
        link: 'https://example.com',
        price: 22,
        tags: ['someTag'],
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid wishlist ID.',
      reason: 'invalidWishlistId',
    });
  });

  it('should reject the request if an invalid title is provided', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        title: 'invalid     title',
        description: 'some description',
        link: 'https://example.com',
        price: 22,
        tags: ['someTag'],
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid title.',
      reason: 'invalidTitle',
    });
  });

  it('should reject the request if an invalid description is provided', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        title: 'some title',
        description: '  invalid description',
        link: 'https://example.com',
        price: 22,
        tags: ['someTag'],
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid description.',
      reason: 'invalidDescription',
    });
  });

  it('should reject the request if an invalid link is provided', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        title: 'some title',
        description: 'some description',
        link: 'https: invalid.com',
        price: 22,
        tags: ['someTag'],
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid link.',
      reason: 'invalidLink',
    });
  });

  it('should reject the request if an invalid price is provided', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        title: 'some title',
        description: 'some description',
        link: 'https://example.com',
        price: 22.3333,
        tags: ['someTag'],
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid price.',
      reason: 'invalidPrice',
    });
  });

  it('should request a connection, begin a transaction, and release it at the end', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        title: 'some title',
        description: 'some description',
        link: 'https://example.com',
        price: 22,
        tags: ['someTag'],
      });

    expect(dbPool.getConnection).toHaveBeenCalledOnce();
    expect(mockConnection.beginTransaction).toHaveBeenCalledOnce();
    expect(mockConnection.release).toHaveBeenCalledOnce();
  });

  it('should reject the request if the wishlist is not found', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          wishlist_id: null,
          wishlist_items_count: 0,
        },
      ],
    ]);

    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        title: 'some title',
        description: 'some description',
        link: 'https://example.com',
        price: 22,
        tags: ['someTag'],
      });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Wishlist not found.',
      reason: 'wishlistNotFound',
    });
  });

  it('should reject the request if the wishlist items count has reached the limit', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          wishlist_id: '818db302-cec8-4fe1-84df-01e2aa505cb1',
          wishlist_items_count: WISHLIST_ITEMS_LIMIT,
        },
      ],
    ]);

    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        title: 'some title',
        description: 'some description',
        link: 'https://example.com',
        price: 22,
        tags: ['someTag'],
      });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(409);
    expect(res.body).toStrictEqual({
      message: 'Wishlist items limit reached.',
      reason: 'itemLimitReached',
    });
  });

  it('should resolve the request, calling insertWishlistItemTags if valid tags were provided, and returning a mapped wishlist item, and calling incrementWishlistInteractivityIndex', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          wishlist_id: '818db302-cec8-4fe1-84df-01e2aa505cb1',
          wishlist_items_count: 1,
        },
      ],
    ]);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([{ insertId: 1 }]);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          id: 1,
          name: 'someTag',
        },
      ],
    ]);
    vi.mocked(wishlistItemTagsDbHelpers.insertWishlistItemTags).mockResolvedValueOnce(true);

    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        title: 'some title',
        description: 'some description',
        link: 'https://example.com',
        price: 22,
        tags: ['someTag'],
      });

    expect(mockConnection.commit).toHaveBeenCalledOnce();
    expect(res.status).toBe(201);
    expect(res.body).toStrictEqual({
      item_id: 1,
      added_on_timestamp: expect.any(Number),
      title: 'some title',
      description: 'some description',
      link: 'https://example.com',
      price: 22,
      purchased_on_timestamp: null,
      tags: [
        {
          id: 1,
          name: 'someTag',
        },
      ],
    });

    expect(wishlistItemTagsDbHelpers.insertWishlistItemTags).toHaveBeenCalledExactlyOnceWith(
      sanitizeWishlistItemTags(['someTag'], 1),
      mockConnection,
      expect.any(Object)
    );
    expect(
      wishlistsDbHelpers.incrementWishlistInteractivityIndex
    ).toHaveBeenCalledExactlyOnceWith(
      '818db302-cec8-4fe1-84df-01e2aa505cb1',
      WISHLIST_INTERACTION_ADD_ITEM,
      dbPool,
      expect.any(Object)
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
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        title: 'some title',
        description: 'some description',
        link: 'https://example.com',
        price: 22,
        tags: ['someTag'],
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

  it('should reject the request if an existing wishlist item with the same title is found, returning its details', async () => {
    const existingWishlistItem: MappedWishlistItem = {
      item_id: 1,
      added_on_timestamp: 1.772e12,
      title: 'some title',
      description: 'some description',
      link: 'https://example.com',
      price: 22,
      purchased_on_timestamp: null,
      tags: [
        {
          id: 1,
          name: 'someTag',
        },
      ],
    };

    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(isSqlError.isSqlError).mockReturnValueOnce(true);
    vi.mocked(wishlistItemsDbHelpers.getWishlistItemByTitle).mockResolvedValueOnce(
      existingWishlistItem
    );

    const unexpectedError = {
      errno: 1062,
      sqlMessage: `Duplicate value for key 'title'`,
    };

    vi.mocked(mockConnection.execute).mockImplementationOnce(() => {
      throw unexpectedError;
    });

    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        title: 'some title',
        description: 'some description',
        link: 'https://example.com',
        price: 22,
        tags: ['someTag'],
      });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(409);
    expect(res.body).toStrictEqual({
      message: 'Another item already uses this title.',
      reason: 'duplicateItemTitle',
      resData: { existingWishlistItem },
    });
  });
});

describe('PATCH /', () => {
  const endpoint: string = '/api/wishlistItems';

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
      itemId: 1,
      title: 'some title',
      description: 'some description',
      link: 'https://example.com',
      price: 22,
      tags: ['someTag'],

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
        itemId: 1,
        title: 'some title',
        description: 'some description',
        link: 'https://example.com',
        price: 22,
        tags: ['someTag'],
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid wishlist ID.',
      reason: 'invalidWishlistId',
    });
  });

  it('should reject the request if an invalid item ID is provided', async () => {
    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        itemId: 1.5,
        title: 'some title',
        description: 'some description',
        link: 'https://example.com',
        price: 22,
        tags: ['someTag'],
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid wishlist item ID.',
      reason: 'invalidItemId',
    });
  });

  it('should reject the request if an invalid title is provided', async () => {
    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        itemId: 1,
        title: 'invalid     title',
        description: 'some description',
        link: 'https://example.com',
        price: 22,
        tags: ['someTag'],
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid title.',
      reason: 'invalidTitle',
    });
  });

  it('should reject the request if an invalid description is provided', async () => {
    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        itemId: 1,
        title: 'some title',
        description: '  invalid description',
        link: 'https://example.com',
        price: 22,
        tags: ['someTag'],
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid description.',
      reason: 'invalidDescription',
    });
  });

  it('should reject the request if an invalid link is provided', async () => {
    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        itemId: 1,
        title: 'some title',
        description: 'some description',
        link: 'https: invalid.com',
        price: 22,
        tags: ['someTag'],
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid link.',
      reason: 'invalidLink',
    });
  });

  it('should reject the request if an invalid price is provided', async () => {
    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        itemId: 1,
        title: 'some title',
        description: 'some description',
        link: 'https://example.com',
        price: 22.3333,
        tags: ['someTag'],
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid price.',
      reason: 'invalidPrice',
    });
  });

  it('should request a connection, begin a transaction, and release it at the end', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        itemId: 1,
        title: 'some title',
        description: 'some description',
        link: 'https://example.com',
        price: 22,
        tags: ['someTag'],
      });

    expect(dbPool.getConnection).toHaveBeenCalledOnce();
    expect(mockConnection.beginTransaction).toHaveBeenCalledOnce();
    expect(mockConnection.release).toHaveBeenCalledOnce();
  });

  it('should reject the request if the wishlist item is not found', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([[]]);

    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        itemId: 1,
        title: 'some title',
        description: 'some description',
        link: 'https://example.com',
        price: 22,
        tags: ['someTag'],
      });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Wishlist item not found.',
      reason: 'itemNotFound',
    });
  });

  it('should reject the request if the user is not the wishlist owner', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          added_on_timestamp: 1.771e12,
          purchased_on_timestamp: 1.772e12,
          tags_count: 1,
          is_wishlist_owner: false,
        },
      ],
    ]);

    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        itemId: 1,
        title: 'some title',
        description: 'some description',
        link: 'https://example.com',
        price: 22,
        tags: ['someTag'],
      });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Wishlist not found.',
      reason: 'wishlistNotFound',
    });
  });

  it('should resolve the request, update the wishlist_items and wishlist_item_tags rows, and returning a mapped wishlist item', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          added_on_timestamp: 1.771e12,
          purchased_on_timestamp: 1.772e12,
          tags_count: 1,
          is_wishlist_owner: true,
        },
      ],
    ]);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([{ affectedRows: 1 }]);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          id: 1,
          name: 'someTag',
        },
      ],
    ]);

    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        itemId: 1,
        title: 'some title',
        description: 'some description',
        link: 'https://example.com',
        price: 22,
        tags: ['someTag'],
      });

    expect(mockConnection.commit).toHaveBeenCalledOnce();
    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      item_id: 1,
      added_on_timestamp: 1.771e12,
      purchased_on_timestamp: 1.772e12,
      title: 'some title',
      description: 'some description',
      link: 'https://example.com',
      price: 22,
      tags: [
        {
          id: 1,
          name: 'someTag',
        },
      ],
    });

    expect(
      wishlistsDbHelpers.incrementWishlistInteractivityIndex
    ).toHaveBeenCalledExactlyOnceWith(
      '818db302-cec8-4fe1-84df-01e2aa505cb1',
      WISHLIST_INTERACTION_GENERAL,
      dbPool,
      expect.any(Object)
    );
  });

  it('should reject the request if an unexpected error occurs and log it', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    const unexpectedError: Error = new Error('someUnexpectedError');

    vi.mocked(mockConnection.execute).mockImplementationOnce(() => {
      throw unexpectedError;
    });

    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        itemId: 1,
        title: 'some title',
        description: 'some description',
        link: 'https://example.com',
        price: 22,
        tags: ['someTag'],
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

  it('should reject the request if an existing wishlist item with the same title is found, returning its details', async () => {
    const existingWishlistItem: MappedWishlistItem = {
      item_id: 1,
      added_on_timestamp: 1.772e12,
      title: 'some title',
      description: 'some description',
      link: 'https://example.com',
      price: 22,
      purchased_on_timestamp: null,
      tags: [
        {
          id: 1,
          name: 'someTag',
        },
      ],
    };

    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(isSqlError.isSqlError).mockReturnValueOnce(true);
    vi.mocked(wishlistItemsDbHelpers.getWishlistItemByTitle).mockResolvedValueOnce(
      existingWishlistItem
    );

    const unexpectedError = {
      errno: 1062,
      sqlMessage: `Duplicate value for key 'title'`,
    };

    vi.mocked(mockConnection.execute).mockImplementationOnce(() => {
      throw unexpectedError;
    });

    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        itemId: 1,
        title: 'some title',
        description: 'some description',
        link: 'https://example.com',
        price: 22,
        tags: ['someTag'],
      });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(409);
    expect(res.body).toStrictEqual({
      message: 'Another item already uses this title.',
      reason: 'duplicateItemTitle',
      resData: { existingWishlistItem },
    });
  });
});

describe('DELETE /', () => {
  function setEndpoint(wishlistId: string, itemId: number): string {
    return `/api/wishlistItems?wishlistId=${wishlistId}&itemId=${itemId}`;
  }

  it('should reject the request if it does not contain an authSessionId cookie', async () => {
    const res = await request(app).delete(
      setEndpoint('818db302-cec8-4fe1-84df-01e2aa505cb1', 1)
    );

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Sign in session expired.',
      reason: 'authSessionExpired',
    });
  });

  it('should reject the request if it contains an invalid authSessionId cookie', async () => {
    const res = await request(app)
      .delete(setEndpoint('818db302-cec8-4fe1-84df-01e2aa505cb1', 1))
      .set('Cookie', 'authSessionId=someInvalidAuthSessionId');

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Sign in session expired.',
      reason: 'authSessionExpired',
    });
  });

  it('should reject the request if an invalid wishlist ID is provided', async () => {
    const res = await request(app)
      .delete(setEndpoint('someInvalidWishlistId', 1))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid wishlist ID.',
      reason: 'invalidWishlistId',
    });
  });

  it('should reject the request if an invalid wishlist item ID is provided', async () => {
    const res = await request(app)
      .delete(setEndpoint('818db302-cec8-4fe1-84df-01e2aa505cb1', 12.5))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid wishlist item ID.',
      reason: 'invalidItemId',
    });
  });

  it('should reject the request if the wishlist is not found', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([[], []]);

    const res = await request(app)
      .delete(setEndpoint('818db302-cec8-4fe1-84df-01e2aa505cb1', 1))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Wishlist not found.',
      reason: 'wishlistNotFound',
    });
  });

  it('should resolve the request if the wishlist item is not found', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          item_exists: 0,
        } as any,
      ],
      [],
    ]);

    const res = await request(app)
      .delete(setEndpoint('818db302-cec8-4fe1-84df-01e2aa505cb1', 1))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({});
  });

  it('should resolve the request if the wishlist item is found, calling incrementWishlistInteractivityIndex', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          item_exists: 1,
        } as any,
      ],
      [],
    ]);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([{ affectedRows: 1 } as any, []]);

    const res = await request(app)
      .delete(setEndpoint('818db302-cec8-4fe1-84df-01e2aa505cb1', 1))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({});

    expect(
      wishlistsDbHelpers.incrementWishlistInteractivityIndex
    ).toHaveBeenCalledExactlyOnceWith(
      '818db302-cec8-4fe1-84df-01e2aa505cb1',
      WISHLIST_INTERACTION_GENERAL,
      dbPool,
      expect.any(Object)
    );
  });

  it('should reject the request if an unexpected error occurs and log it', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    const unexpectedError: Error = new Error('someUnexpectedError');

    vi.mocked(dbPool.execute).mockImplementationOnce(() => {
      throw unexpectedError;
    });

    const res = await request(app)
      .delete(setEndpoint('818db302-cec8-4fe1-84df-01e2aa505cb1', 1))
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

describe('DELETE /bulk', () => {
  const endpoint: string = '/api/wishlistItems/bulk';

  it('should reject the request if it does not contain an authSessionId cookie', async () => {
    const res = await request(app).delete(endpoint).send({});

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Sign in session expired.',
      reason: 'authSessionExpired',
    });
  });

  it('should reject the request if it contains an invalid authSessionId cookie', async () => {
    const res = await request(app)
      .delete(endpoint)
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
      itemsIdArr: [1, 2],

      someOtherValue: 23,
    };

    const res1 = await request(app)
      .delete(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send(reqBody1);

    const res2 = await request(app)
      .delete(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send(reqBody2);

    const res3 = await request(app)
      .delete(endpoint)
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
      .delete(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: 'someInvalidWishlistId',
        itemsIdArr: [1, 2],
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid wishlist ID.',
      reason: 'invalidWishlistId',
    });
  });

  it('should reject the request if the itemsIdArr is empty', async () => {
    const res = await request(app)
      .delete(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        itemsIdArr: [],
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid items selection.',
      reason: 'invalidItemsArr',
    });
  });

  it('should reject the request if the itemsIdArr has a length greater than the limit', async () => {
    const itemsIdArr: number[] = [];
    itemsIdArr[WISHLIST_ITEMS_LIMIT + 1] = 3;

    const res = await request(app)
      .delete(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        itemsIdArr,
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid items selection.',
      reason: 'invalidItemsArr',
    });
  });

  it('should reject the request if the itemsIdArr contains invalid item IDs', async () => {
    const res = await request(app)
      .delete(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        itemsIdArr: [1, 12.5],
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid items selection.',
      reason: 'invalidItemsArr',
    });
  });

  it('should reject the request if the wishlist is not found', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([[], []]);

    const res = await request(app)
      .delete(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        itemsIdArr: [1, 2],
      });

    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Wishlist not found.',
      reason: 'wishlistNotFound',
    });
  });

  it('should reject the request if the user is not the owner', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          is_wishlist_owner: 0,
        } as any,
      ],
      [],
    ]);

    const res = await request(app)
      .delete(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        itemsIdArr: [1, 2],
      });

    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Wishlist not found.',
      reason: 'wishlistNotFound',
    });
  });

  it('should resolve the request, calling incrementWishlistInteractivityIndex and returning the count of deleted items', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          is_wishlist_owner: 1,
        } as any,
      ],
      [],
    ]);
    vi.mocked(dbPool.query).mockResolvedValueOnce([{ affectedRows: 2 } as any, []]);

    const res = await request(app)
      .delete(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        itemsIdArr: [1, 2],
      });

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      deletedItemsCount: 2,
    });

    expect(
      wishlistsDbHelpers.incrementWishlistInteractivityIndex
    ).toHaveBeenCalledExactlyOnceWith(
      '818db302-cec8-4fe1-84df-01e2aa505cb1',
      WISHLIST_INTERACTION_BULK_SMALL,
      dbPool,
      expect.any(Object)
    );
  });

  it('should reject the request if an unexpected error occurs and log it', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    const unexpectedError: Error = new Error('someUnexpectedError');

    vi.mocked(dbPool.execute).mockImplementationOnce(() => {
      throw unexpectedError;
    });

    const res = await request(app)
      .delete(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        itemsIdArr: [1, 2],
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

describe('PATCH /purchaseStatus', () => {
  const endpoint: string = '/api/wishlistItems/purchaseStatus';

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
      itemId: 1,
      markAsPurchased: true,

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
        itemId: 1,
        markAsPurchased: true,
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid wishlist ID.',
      reason: 'invalidWishlistId',
    });
  });

  it('should reject the request if an invalid wishlist item ID is provided', async () => {
    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        itemId: 12.5,
        markAsPurchased: true,
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid wishlist item ID.',
      reason: 'invalidItemId',
    });
  });

  it('should reject the request if an invalid markAsPurchased value is provided', async () => {
    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        itemId: 1,
        markAsPurchased: 'someInvalidValue',
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid purchase status.',
      reason: 'invalidPurchaseStatus',
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
        itemId: 1,
        markAsPurchased: true,
      });

    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Wishlist not found.',
      reason: 'wishlistNotFound',
    });
  });

  it('should reject the request if the wishlist item is not found', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          item_exists: false,
          purchased_on_timestamp: null,
        } as any,
      ],
      [],
    ]);

    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        itemId: 1,
        markAsPurchased: true,
      });

    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Wishlist item not found.',
      reason: 'itemNotFound',
    });
  });

  it(`should resolve the request if the item's purchase status matches the requested purchase status`, async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          item_exists: true,
          purchased_on_timestamp: 1.772e12,
        } as any,
      ],
      [],
    ]);

    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        itemId: 1,
        markAsPurchased: true,
      });

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      newPurchasedOnTimestamp: 1.772e12,
    });
  });

  it('should resolve the request, returning the newPurchasedOnTimestamp and calling incrementWishlistInteractivityIndex', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          item_exists: true,
          purchased_on_timestamp: 1.772e12,
        } as any,
      ],
      [],
    ]);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      {
        affectedRows: 1,
      } as any,
      [],
    ]);

    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        itemId: 1,
        markAsPurchased: false,
      });

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      newPurchasedOnTimestamp: null,
    });

    expect(
      wishlistsDbHelpers.incrementWishlistInteractivityIndex
    ).toHaveBeenCalledExactlyOnceWith(
      '818db302-cec8-4fe1-84df-01e2aa505cb1',
      WISHLIST_INTERACTION_GENERAL,
      dbPool,
      expect.any(Object)
    );
  });

  it('should reject the request if an unexpected error occurs and log it', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    const unexpectedError: Error = new Error('someUnexpectedError');

    vi.mocked(dbPool.execute).mockImplementationOnce(() => {
      throw unexpectedError;
    });

    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        wishlistId: '818db302-cec8-4fe1-84df-01e2aa505cb1',
        itemId: 1,
        markAsPurchased: true,
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
