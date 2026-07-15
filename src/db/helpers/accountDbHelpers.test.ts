import { describe, expect, it, vi } from 'vitest';
import {
  deleteAccountById,
  handleIncorrectPassword,
  incrementAccountRequestEmailsSent,
  incrementFailedAccountRequestAttempts,
  resetFailedSignInAttempts,
  suspendAccountRequest,
} from './accountDbHelpers';
import { dbPool } from '../db';
import {
  ACCOUNT_EMAILS_SENT_LIMIT,
  ACCOUNT_FAILED_ATTEMPTS_LIMIT,
  ACCOUNT_FAILED_SIGN_IN_LIMIT,
} from '../../util/constants/accountConstants';
import * as errorLogger from '../../logs/errorLogger';
import { mockReq, mockRes } from '../../tests/setup';
import * as authSessions from '../../auth/authSessions';
import * as cookieUtils from '../../util/cookieUtils';

vi.mock('../../logs/errorLogger');
vi.mock('../../auth/authSessions');
vi.mock('../../util/cookieUtils');

describe('incrementAccountRequestEmailsSent', () => {
  it('should increment the emails_sent value of the table name provided, returning a boolean as to whether the operation was successful', async () => {
    vi.mocked(dbPool.execute).mockResolvedValueOnce([{ affectedRows: 1 } as any, []]);

    const result = await incrementAccountRequestEmailsSent(
      'account_verification',
      1,
      dbPool,
      mockReq
    );

    expect(result).toBe(true);
    expect(dbPool.execute).toHaveBeenCalledExactlyOnceWith(
      `UPDATE
        account_verification
      SET
        emails_sent = LEAST(?, emails_sent + 1)
      WHERE
        request_id = ?;`,
      [ACCOUNT_EMAILS_SENT_LIMIT, 1]
    );
  });

  it('should catch unexpected errors, log them, and return false', async () => {
    vi.mocked(dbPool.execute).mockRejectedValue({});

    const result = await incrementAccountRequestEmailsSent(
      'account_verification',
      1,
      dbPool,
      mockReq
    );

    expect(result).toBe(false);
    expect(errorLogger.logUnexpectedError).toHaveBeenCalledExactlyOnceWith(
      mockReq,
      {},
      'Failed to increment emails_sent for account_verification.'
    );
  });
});

describe('incrementFailedAccountRequestAttempts', () => {
  it('should increment the emails_sent value of the table name provided, returning a boolean as to whether the operation was successful', async () => {
    vi.mocked(dbPool.execute).mockResolvedValueOnce([{ affectedRows: 1 } as any, []]);

    const result = await incrementFailedAccountRequestAttempts(
      'account_verification',
      1,
      dbPool,
      mockReq
    );

    expect(result).toBe(true);
    expect(dbPool.execute).toHaveBeenCalledExactlyOnceWith(
      `UPDATE
        account_verification
      SET
        failed_attempts = LEAST(?, failed_attempts + 1)
      WHERE
        request_id = ?;`,
      [ACCOUNT_FAILED_ATTEMPTS_LIMIT, 1]
    );
  });

  it('should catch unexpected errors, log them, and return false', async () => {
    vi.mocked(dbPool.execute).mockRejectedValue({});

    const result = await incrementFailedAccountRequestAttempts(
      'account_verification',
      1,
      dbPool,
      mockReq
    );

    expect(result).toBe(false);
    expect(errorLogger.logUnexpectedError).toHaveBeenCalledExactlyOnceWith(
      mockReq,
      {},
      'Failed to increment failed_attempts for account_verification.'
    );
  });
});

describe('suspendAccountRequest', () => {
  it('should suspend the account request for the table provided, returning null if the operation fails, and the newExpiryTimestamp if it succeeds', async () => {
    vi.mocked(dbPool.execute).mockResolvedValueOnce([{ affectedRows: 1 } as any, []]);

    const result = await suspendAccountRequest('account_recovery', 1, dbPool, mockReq);

    expect(result).toBeTypeOf('number');
    expect(dbPool.execute).toHaveBeenCalledExactlyOnceWith(
      `UPDATE
        account_recovery
      SET
        failed_attempts = ?,
        expiry_timestamp = ?
      WHERE
        request_id = ?;`,
      [ACCOUNT_FAILED_ATTEMPTS_LIMIT, expect.any(Number), 1]
    );
  });

  it('should catch unexpected errors, log them, and return null', async () => {
    vi.mocked(dbPool.execute).mockRejectedValue({});

    const result = await suspendAccountRequest('account_recovery', 1, dbPool, mockReq);

    expect(result).toBe(null);
    expect(errorLogger.logUnexpectedError).toHaveBeenCalledExactlyOnceWith(
      mockReq,
      {},
      'Failed to suspend account_recovery request.'
    );
  });
});

describe('handleIncorrectPassword', () => {
  it('should reject the request and increment the failed_sign_in_attempts value in the accounts table', async () => {
    vi.mocked(dbPool.execute).mockResolvedValueOnce([{ affectedRows: 1 } as any, []]);

    await handleIncorrectPassword(1, 0, dbPool, mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledExactlyOnceWith(401);
    expect(mockRes.json).toHaveBeenCalledExactlyOnceWith({
      message: 'Incorrect password.',
      reason: 'incorrectPassword',
    });
  });

  it('should reject the request, increment the failed_sign_in_attempts value in the accounts table, and if the failed sign in limit is reached, call removeRequestCookie and purgeAuthSessions', async () => {
    vi.mocked(dbPool.execute).mockResolvedValueOnce([{ affectedRows: 1 } as any, []]);
    await handleIncorrectPassword(1, ACCOUNT_FAILED_SIGN_IN_LIMIT, dbPool, mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledExactlyOnceWith(401);
    expect(mockRes.json).toHaveBeenCalledExactlyOnceWith({
      message: 'Incorrect password. Account locked.',
      reason: 'incorrectPassword_locked',
    });
    expect(cookieUtils.removeRequestCookie).toHaveBeenCalledExactlyOnceWith(
      mockRes,
      'authSessionId'
    );
    expect(authSessions.purgeAuthSessions).toHaveBeenCalledExactlyOnceWith(1);
  });
});

describe('resetFailedSignInAttempts', () => {
  it('should reset the failed_sign_in_attempts value in the accounts table, returning a boolean as to whether the operation was successful', async () => {
    vi.mocked(dbPool.execute).mockResolvedValueOnce([{ affectedRows: 1 } as any, []]);

    const result = await resetFailedSignInAttempts(1, dbPool, mockReq);

    expect(result).toBe(true);
    expect(dbPool.execute).toHaveBeenCalledExactlyOnceWith(
      `UPDATE
        accounts
      SET
        failed_sign_in_attempts = ?
      WHERE
        account_id = ?;`,
      [0, 1]
    );
  });

  it('should catch unexpected errors, log them, and return false', async () => {
    vi.mocked(dbPool.execute).mockRejectedValue({});

    const result = await resetFailedSignInAttempts(1, dbPool, mockReq);

    expect(result).toBe(false);
    expect(errorLogger.logUnexpectedError).toHaveBeenCalledExactlyOnceWith(
      mockReq,
      {},
      'Failed to reset failed_sign_in_attempts.'
    );
  });
});

describe('deleteAccountById', () => {
  it('should reset the failed_sign_in_attempts value in the accounts table, returning a boolean as to whether the operation was successful', async () => {
    vi.mocked(dbPool.execute).mockResolvedValueOnce([{ affectedRows: 1 } as any, []]);

    const result = await deleteAccountById(1, dbPool, mockReq);

    expect(result).toBe(true);
    expect(dbPool.execute).toHaveBeenCalledExactlyOnceWith(
      `DELETE FROM
        accounts
      WHERE
        account_id = ?;`,
      [1]
    );
  });

  it('should catch unexpected errors, log them, and return false', async () => {
    vi.mocked(dbPool.execute).mockRejectedValue({});

    const result = await deleteAccountById(1, dbPool, mockReq);

    expect(result).toBe(false);
    expect(errorLogger.logUnexpectedError).toHaveBeenCalledExactlyOnceWith(
      mockReq,
      {},
      'Failed to delete account.'
    );
  });
});
