import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { dbPool } from '../db/db';
import { dayMilliseconds, hourMilliseconds } from '../util/constants/globalConstants';
import * as errorLogger from '../logs/errorLogger';
import * as authSessions from '../auth/authSessions';
import * as cookieUtils from '../util/cookieUtils';

vi.mock('../logs/errorLogger');
vi.mock('../auth/authSessions');
vi.mock('../util/cookieUtils', { spy: true });

describe('GET /session', () => {
  const endpoint: string = '/api/auth/session';
  it('should call getRequestCookie', async () => {
    await request(app).get(endpoint);

    expect(cookieUtils.getRequestCookie).toHaveBeenCalledExactlyOnceWith(
      expect.any(Object),
      'authSessionId'
    );
  });

  it('should return false if no authSessionId cookie is found', async () => {
    const res = await request(app).get(endpoint);

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({ isValidAuthSession: false });
  });

  it('should return false if an invalid authSessionId cookie is provided', async () => {
    const res = await request(app)
      .get(endpoint)
      .set('Cookie', 'authSessionId=someInvalidAuthSessionId');

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({ isValidAuthSession: false });
  });

  it('should return false if the auth session is not found, calling removeRequestCookie', async () => {
    vi.mocked(dbPool.execute).mockResolvedValueOnce([[], []]);

    const res = await request(app)
      .get(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({ isValidAuthSession: false });

    expect(cookieUtils.removeRequestCookie).toHaveBeenCalledExactlyOnceWith(
      expect.any(Object),
      'authSessionId'
    );
  });

  it('should return false if the auth session is expired, calling removeRequestCookie and destroyAuthSession', async () => {
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          account_id: 1,
          expiry_timestamp: 1.77e12,
          keep_signed_in: false,
          extensions_count: 0,
        } as any,
      ],
      [],
    ]);

    const res = await request(app)
      .get(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({ isValidAuthSession: false });

    expect(cookieUtils.removeRequestCookie).toHaveBeenCalledExactlyOnceWith(
      expect.any(Object),
      'authSessionId'
    );
    expect(authSessions.destroyAuthSession).toHaveBeenCalledExactlyOnceWith(
      '818db302-cec8-4fe1-84df-01e2aa505cb6'
    );
  });

  it('should return true if a valid auth session is found', async () => {
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          account_id: 1,
          expiry_timestamp: Date.now() + dayMilliseconds,
          keep_signed_in: false,
          extensions_count: 0,
        } as any,
      ],
      [],
    ]);

    const res = await request(app)
      .get(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({ isValidAuthSession: true });
  });

  it('should extend the auth session expiry timestamp if it is less than a day old, keep_signed_in is true, and the extension limit has not been reached', async () => {
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          account_id: 1,
          expiry_timestamp: Date.now() + hourMilliseconds,
          keep_signed_in: true,
          extensions_count: 0,
        } as any,
      ],
      [],
    ]);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([{ affectedRows: 1 } as any, []]);

    const res = await request(app)
      .get(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({ isValidAuthSession: true });

    expect(cookieUtils.setResponseCookie).toHaveBeenCalledExactlyOnceWith(
      expect.any(Object),
      'authSessionId',
      expect.any(String),
      dayMilliseconds,
      true
    );
  });

  it('should return false if an unexpected error occurs and log it', async () => {
    const unexpectedError: Error = new Error('someUnexpectedError');

    vi.mocked(dbPool.execute).mockRejectedValueOnce(unexpectedError);

    const res = await request(app)
      .get(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({ isValidAuthSession: false });

    expect(errorLogger.logUnexpectedError).toHaveBeenCalledExactlyOnceWith(
      expect.any(Object),
      unexpectedError
    );
  });
});

describe('DELETE /session', () => {
  const endpoint: string = '/api/auth/session';
  it('should call getRequestCookie', async () => {
    await request(app).delete(endpoint);

    expect(cookieUtils.getRequestCookie).toHaveBeenCalledExactlyOnceWith(
      expect.any(Object),
      'authSessionId'
    );
  });

  it('should always resolve the request', async () => {
    const res1 = await request(app).delete(endpoint);
    const res2 = await request(app)
      .delete(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);

    expect(res1.body).toStrictEqual({});
    expect(res2.body).toStrictEqual({});
  });

  it('should call removeRequestCookie if an authSessionId cookie is found', async () => {
    const res1 = await request(app)
      .delete(endpoint)
      .set('Cookie', 'authSessionId=someInvalidAuthSessionId');
    const res2 = await request(app)
      .delete(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);

    expect(res1.body).toStrictEqual({});
    expect(res2.body).toStrictEqual({});

    expect(cookieUtils.removeRequestCookie).toHaveBeenCalledTimes(2);
    expect(cookieUtils.removeRequestCookie).toHaveBeenCalledWith(
      expect.any(Object),
      'authSessionId'
    );
  });

  it('should attempt to delete the auth session if a valid authSessionId cookie is provided', async () => {
    const res = await request(app)
      .delete(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({});

    expect(dbPool.execute).toHaveBeenCalledExactlyOnceWith(
      `DELETE FROM
          auth_sessions
        WHERE
          session_id = ?;`,
      ['818db302-cec8-4fe1-84df-01e2aa505cb6']
    );
  });

  it('should call logUnexpectedError if an unexpected error is caught when attempting to delete the authSession', async () => {
    const unexpectedError: Error = new Error('someUnexpectedError');
    vi.mocked(dbPool.execute).mockRejectedValueOnce(unexpectedError);

    const res = await request(app)
      .delete(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({});

    expect(errorLogger.logUnexpectedError).toHaveBeenCalledExactlyOnceWith(
      expect.any(Object),
      unexpectedError
    );
  });
});
