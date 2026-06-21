import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { dbPool } from '../db/db';
import * as authDbHelpers from '../db/helpers/authDbHelpers';

vi.mock('../db/helpers/authDbHelpers');

describe('GET /:offset', () => {
  function setEndpoint(offset: number): string {
    return `/api/notifications/${offset}`;
  }

  it('should reject the request if no authSessionId cookie is found', async () => {
    const res = await request(app).get(setEndpoint(0));

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Sign in session expired.',
      reason: 'authSessionExpired',
    });
  });

  it('should reject the request if an invalid authSessionId is provided', async () => {
    const res = await request(app)
      .get(setEndpoint(0))
      .set('Cookie', 'authSessionId=someInvalidAuthSessionId');

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Sign in session expired.',
      reason: 'authSessionExpired',
    });
  });

  it('should reject the request if an invalid offset is provided', async () => {
    const res = await request(app)
      .get(setEndpoint('invalidOffset' as any))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid offset.',
      reason: 'invalidOffset',
    });
  });

  it('should resolve the request and return any notifications found', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          notification_id: 1,
          notification_timestamp: 1.77e12,
          notification_type: 'new_follower',

          sender_public_account_id: 2,
          sender_username: 'saraSmith',
          sender_display_name: 'Sara Smith',
        } as any,
      ],
      [],
    ]);

    const res = await request(app)
      .get(setEndpoint(0))
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual([
      {
        notification_id: 1,
        notification_timestamp: 1.77e12,
        notification_type: 'new_follower',

        sender_public_account_id: 2,
        sender_username: 'saraSmith',
        sender_display_name: 'Sara Smith',
      },
    ]);
  });
});
