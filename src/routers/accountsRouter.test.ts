import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import * as userValidation from '../util/validation/userValidation';
import { mockConnection } from '../tests/setup';
import * as emailServices from '../util/email/emailServices';
import { dbPool } from '../db/db';
import {
  ACCOUNT_EMAILS_SENT_LIMIT,
  ACCOUNT_FAILED_ATTEMPTS_LIMIT,
  ACCOUNT_FAILED_SIGN_IN_LIMIT,
} from '../util/constants/accountConstants';
import * as accountDbHelpers from '../db/helpers/accountDbHelpers';
import * as errorLogger from '../logs/errorLogger';
import * as isSqlError from '../util/sqlUtils/isSqlError';
import * as authSessions from '../auth/authSessions';
import * as authDbHelpers from '../db/helpers/authDbHelpers';
import * as bcrypt from 'bcrypt';

vi.mock('../util/validation/userValidation', { spy: true });
vi.mock('../util/email/emailServices');
vi.mock('../db/helpers/accountDbHelpers', { spy: true });
vi.mock('../logs/errorLogger');
vi.mock('../util/sqlUtils/isSqlError');
vi.mock('../auth/authSessions');
vi.mock('../db/helpers/authDbHelpers');
vi.mock('bcrypt');

describe('POST /signUp', () => {
  const endpoint: string = '/api/accounts/signUp';

  it('should reject the request if the user is signed in', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=someAuthSessionId')
      .send({});

    expect(res.status).toBe(403);
    expect(res.body).toStrictEqual({
      message: 'You must sign out before proceeding.',
      reason: 'signedIn',
    });
  });

  it('should reject the request if its body contains extra keys or does not contain all expected keys', async () => {
    const reqBody1 = {};
    const reqBody2 = { username: 'johnDoe' };
    const reqBody3 = {
      dateOfBirthTimestamp: Date.now(),
      email: 'example@example.com',
      username: 'johnDoe',
      password: 'somePassword',
      displayName: 'John Doe',
      someOtherValue: 23,
    };

    const res1 = await request(app).post(endpoint).send(reqBody1);
    const res2 = await request(app).post(endpoint).send(reqBody2);
    const res3 = await request(app).post(endpoint).send(reqBody3);

    expect(res1.status).toBe(400);
    expect(res2.status).toBe(400);
    expect(res3.status).toBe(400);

    expect(res1.body).toStrictEqual({ message: 'Invalid request data.' });
    expect(res2.body).toStrictEqual({ message: 'Invalid request data.' });
    expect(res3.body).toStrictEqual({ message: 'Invalid request data.' });
  });

  it('should reject the request if an invalid date of birth timestamp is provided', async () => {
    const dateOfBirthTimestamp: number = new Date(1775, 1, 1).getTime();

    const res = await request(app).post(endpoint).send({
      dateOfBirthTimestamp,
      email: 'example@example.com',
      username: 'johnDoe',
      password: 'somePassword',
      displayName: 'John Doe',
    });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid date of birth.',
      reason: 'invalidDateOfBirth',
    });

    expect(userValidation.isValidDateOfBirthTimestamp).toHaveBeenCalledExactlyOnceWith(
      dateOfBirthTimestamp
    );
  });

  it('should reject the request if an invalid email is provided', async () => {
    const res = await request(app)
      .post(endpoint)
      .send({
        dateOfBirthTimestamp: new Date(2001, 1, 1).getTime(),
        email: 'someInvalidEmail',
        username: 'johnDoe',
        password: 'somePassword',
        displayName: 'John Doe',
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid email.',
      reason: 'invalidEmail',
    });

    expect(userValidation.isValidEmail).toHaveBeenCalledExactlyOnceWith('someInvalidEmail');
  });

  it('should reject the request if an invalid username is provided', async () => {
    const res = await request(app)
      .post(endpoint)
      .send({
        dateOfBirthTimestamp: new Date(2001, 1, 1).getTime(),
        email: 'example@example.com',
        username: 'invalid username',
        password: 'somePassword',
        displayName: 'John Doe',
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid username.',
      reason: 'invalidUsername',
    });

    expect(userValidation.isValidUsername).toHaveBeenCalledExactlyOnceWith('invalid username');
  });

  it('should reject the request if an invalid password is provided', async () => {
    const res = await request(app)
      .post(endpoint)
      .send({
        dateOfBirthTimestamp: new Date(2001, 1, 1).getTime(),
        email: 'example@example.com',
        username: 'johnDoe',
        password: 'invalid password',
        displayName: 'John Doe',
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid password.',
      reason: 'invalidPassword',
    });

    expect(userValidation.isValidNewPassword).toHaveBeenCalledExactlyOnceWith(
      'invalid password'
    );
  });

  it('should reject the request if an invalid display name is provided', async () => {
    const res = await request(app)
      .post(endpoint)
      .send({
        dateOfBirthTimestamp: new Date(2001, 1, 1).getTime(),
        email: 'example@example.com',
        username: 'johnDoe',
        password: 'somePassword',
        displayName: 'John Doe 23!',
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid display name.',
      reason: 'invalidDisplayName',
    });

    expect(userValidation.isValidDisplayName).toHaveBeenCalledExactlyOnceWith('John Doe 23!');
  });

  it('should reject the request if the username and password provided are identical', async () => {
    const res = await request(app)
      .post(endpoint)
      .send({
        dateOfBirthTimestamp: new Date(2001, 1, 1).getTime(),
        email: 'example@example.com',
        username: 'someUsername',
        password: 'someUsername',
        displayName: 'John Doe',
      });

    expect(res.status).toBe(409);
    expect(res.body).toStrictEqual({
      message: `Username and password can't match.`,
      reason: 'passwordMatchesUsername',
    });
  });

  it('should request a connection, begin a transaction, and release it at the end', async () => {
    await request(app)
      .post(endpoint)
      .send({
        dateOfBirthTimestamp: new Date(2001, 1, 1).getTime(),
        email: 'example@example.com',
        username: 'johnDoe',
        password: 'somePassword',
        displayName: 'John Doe',
      });

    expect(dbPool.getConnection).toHaveBeenCalledOnce();
    expect(mockConnection.beginTransaction).toHaveBeenCalledOnce();
    expect(mockConnection.release).toHaveBeenCalledOnce();
  });

  it('should reject the request if the email provided is taken', async () => {
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          email_taken: 1,
          email_temporarily_taken: 0,
          username_taken: 0,
        },
      ],
    ]);

    const res = await request(app)
      .post(endpoint)
      .send({
        dateOfBirthTimestamp: new Date(2001, 1, 1).getTime(),
        email: 'example@example.com',
        username: 'johnDoe',
        password: 'somePassword',
        displayName: 'John Doe',
      });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(409);
    expect(res.body).toStrictEqual({
      message: 'Email is taken.',
      reason: 'emailTaken',
    });
  });

  it('should reject the request if the email provided is temporarily taken', async () => {
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          email_taken: 0,
          email_temporarily_taken: 1,
          username_taken: 0,
        },
      ],
    ]);

    const res = await request(app)
      .post(endpoint)
      .send({
        dateOfBirthTimestamp: new Date(2001, 1, 1).getTime(),
        email: 'example@example.com',
        username: 'johnDoe',
        password: 'somePassword',
        displayName: 'John Doe',
      });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(409);
    expect(res.body).toStrictEqual({
      message: 'Email is taken.',
      reason: 'emailTaken',
    });
  });

  it('should reject the request if the username provided is taken', async () => {
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          email_taken: 0,
          email_temporarily_taken: 0,
          username_taken: 1,
        },
      ],
    ]);

    const res = await request(app)
      .post(endpoint)
      .send({
        dateOfBirthTimestamp: new Date(2001, 1, 1).getTime(),
        email: 'example@example.com',
        username: 'johnDoe',
        password: 'somePassword',
        displayName: 'John Doe',
      });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(409);
    expect(res.body).toStrictEqual({
      message: 'Username is taken.',
      reason: 'usernameTaken',
    });
  });

  it('should resolve the request if valid, non-taken credentials are provided, returning the public account ID of the account created and calling sendAccountVerificationEmailService', async () => {
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          email_taken: 0,
          email_temporarily_taken: 0,
          username_taken: 0,
        },
      ],
    ]);

    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      {
        insertId: 1,
      },
    ]);

    const res = await request(app)
      .post(endpoint)
      .send({
        dateOfBirthTimestamp: new Date(2001, 1, 1).getTime(),
        email: 'example@example.com',
        username: 'johnDoe',
        password: 'somePassword',
        displayName: 'John Doe',
      });

    expect(mockConnection.commit).toHaveBeenCalledOnce();
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('publicAccountId');
    expect(res.body.publicAccountId).toBeTypeOf('string');

    expect(emailServices.sendAccountVerificationEmailService).toHaveBeenCalledExactlyOnceWith({
      receiver: 'example@example.com',
      displayName: 'John Doe',
      publicAccountId: expect.any(String),
      verificationToken: expect.any(String),
    });
  });

  it('should reject the request if an unexpected error occurs and log it', async () => {
    const unexpectedError: Error = new Error('someUnexpectedError');

    vi.mocked(mockConnection.execute).mockImplementationOnce(() => {
      throw unexpectedError;
    });

    const res = await request(app)
      .post(endpoint)
      .send({
        dateOfBirthTimestamp: new Date(2001, 1, 1).getTime(),
        email: 'example@example.com',
        username: 'johnDoe',
        password: 'somePassword',
        displayName: 'John Doe',
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

  it('should reject the request if an SqlError is thrown indicating that the email is taken', async () => {
    vi.mocked(isSqlError.isSqlError).mockReturnValueOnce(true);

    const unexpectedError = {
      errno: 1062,
      sqlMessage: `Duplicate entry for key 'email'`,
    };

    vi.mocked(mockConnection.execute).mockImplementationOnce(() => {
      throw unexpectedError;
    });

    const res = await request(app)
      .post(endpoint)
      .send({
        dateOfBirthTimestamp: new Date(2001, 1, 1).getTime(),
        email: 'example@example.com',
        username: 'johnDoe',
        password: 'somePassword',
        displayName: 'John Doe',
      });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(409);
    expect(res.body).toStrictEqual({
      message: 'Email is taken.',
      reason: 'emailTaken',
    });
  });

  it('should reject the request if an SqlError is thrown indicating that the username is taken', async () => {
    vi.mocked(isSqlError.isSqlError).mockReturnValueOnce(true);

    const unexpectedError = {
      errno: 1062,
      sqlMessage: `Duplicate entry for key 'username'`,
    };

    vi.mocked(mockConnection.execute).mockImplementationOnce(() => {
      throw unexpectedError;
    });

    const res = await request(app)
      .post(endpoint)
      .send({
        dateOfBirthTimestamp: new Date(2001, 1, 1).getTime(),
        email: 'example@example.com',
        username: 'johnDoe',
        password: 'somePassword',
        displayName: 'John Doe',
      });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(409);
    expect(res.body).toStrictEqual({
      message: 'Username is taken.',
      reason: 'usernameTaken',
    });
  });
});

describe('POST /verification/continue', () => {
  const endpoint: string = '/api/accounts/verification/continue';

  it('should reject the request if the user is signed in', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=someAuthSessionId')
      .send({});

    expect(res.status).toBe(403);
    expect(res.body).toStrictEqual({
      message: 'You must sign out before proceeding.',
      reason: 'signedIn',
    });
  });

  it('should reject the request if its body contains extra keys or does not contain all expected keys', async () => {
    const reqBody1 = {};
    const reqBody2 = { someOtherValue: 23 };
    const reqBody3 = {
      email: 'example@example.com',
      someOtherValue: 23,
    };

    const res1 = await request(app).post(endpoint).send(reqBody1);
    const res2 = await request(app).post(endpoint).send(reqBody2);
    const res3 = await request(app).post(endpoint).send(reqBody3);

    expect(res1.status).toBe(400);
    expect(res2.status).toBe(400);
    expect(res3.status).toBe(400);

    expect(res1.body).toStrictEqual({ message: 'Invalid request data.' });
    expect(res2.body).toStrictEqual({ message: 'Invalid request data.' });
    expect(res3.body).toStrictEqual({ message: 'Invalid request data.' });
  });

  it('should reject the request if an invalid email is provided', async () => {
    const res = await request(app).post(endpoint).send({
      email: 'invalidEmail',
    });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid email.',
      reason: 'invalidEmail',
    });
  });

  it('should reject the request if the account is verified', async () => {
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          account_id: 3,
          public_account_id: '818db302-cec8-4fe1-84df-01e2aa505cb6',
          is_verified: true,
          verification_request_exists: 1,
        },
      ],
    ] as any);

    const res = await request(app).post(endpoint).send({
      email: 'example@example.com',
    });

    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Verification request not found.',
      reason: 'requestNotFound',
    });
  });

  it(`should resolve the request and return the public account ID`, async () => {
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          account_id: 3,
          public_account_id: '818db302-cec8-4fe1-84df-01e2aa505cb6',
          is_verified: false,
          verification_request_exists: 1,
        },
      ],
    ] as any);

    const res = await request(app).post(endpoint).send({
      email: 'example@example.com',
    });

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      publicAccountId: '818db302-cec8-4fe1-84df-01e2aa505cb6',
    });
  });

  it('should reject the request if an unexpected error occurs and log it', async () => {
    const unexpectedError: Error = new Error('someUnexpectedError');

    vi.mocked(dbPool.execute).mockImplementationOnce(() => {
      throw unexpectedError;
    });

    const res = await request(app).post(endpoint).send({
      email: 'example@example.com',
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

describe('PATCH /verification/resendEmail', () => {
  const endpoint: string = '/api/accounts/verification/resendEmail';

  it('should reject the request if the user is signed in', async () => {
    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=someAuthSessionId')
      .send({});

    expect(res.status).toBe(403);
    expect(res.body).toStrictEqual({
      message: 'You must sign out before proceeding.',
      reason: 'signedIn',
    });
  });

  it('should reject the request if its body contains extra keys or does not contain all expected keys', async () => {
    const reqBody1 = {};
    const reqBody2 = { someOtherValue: 23 };
    const reqBody3 = {
      publicAccountId: 'somePublicAccountId',
      someOtherValue: 23,
    };

    const res1 = await request(app).patch(endpoint).send(reqBody1);
    const res2 = await request(app).patch(endpoint).send(reqBody2);
    const res3 = await request(app).patch(endpoint).send(reqBody3);

    expect(res1.status).toBe(400);
    expect(res2.status).toBe(400);
    expect(res3.status).toBe(400);

    expect(res1.body).toStrictEqual({ message: 'Invalid request data.' });
    expect(res2.body).toStrictEqual({ message: 'Invalid request data.' });
    expect(res3.body).toStrictEqual({ message: 'Invalid request data.' });
  });

  it('should reject the request if an invalid public account ID is provided', async () => {
    const res = await request(app).patch(endpoint).send({
      publicAccountId: 'someInvalidPublicAccountId',
    });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid account ID.',
      reason: 'invalidPublicAccountId',
    });
  });

  it('should request a connection, begin a transaction, and release it at the end', async () => {
    await request(app).patch(endpoint).send({
      publicAccountId: '818db302-cec8-4fe1-84df-01e2aa505cb6',
    });

    expect(dbPool.getConnection).toHaveBeenCalledOnce();
    expect(mockConnection.beginTransaction).toHaveBeenCalledOnce();
    expect(mockConnection.release).toHaveBeenCalledOnce();
  });

  it('should reject the request if the account is not found', async () => {
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([[]]);

    const res = await request(app).patch(endpoint).send({
      publicAccountId: '818db302-cec8-4fe1-84df-01e2aa505cb6',
    });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Account not found.',
      reason: 'accountNotFound',
    });
  });

  it('should reject the request if the account is verified', async () => {
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          account_id: 1,
          public_account_id: '818db302-cec8-4fe1-84df-01e2aa505cb6',
          email: 'example@example.com',
          display_name: 'John Doe',
          is_verified: true,
          verification_request_id: null,
          verification_token: null,
          emails_sent: null,
          failed_attempts: null,
        },
      ],
    ]);

    const res = await request(app).patch(endpoint).send({
      publicAccountId: '818db302-cec8-4fe1-84df-01e2aa505cb6',
    });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(409);
    expect(res.body).toStrictEqual({
      message: 'Account is already verified.',
      reason: 'alreadyVerified',
    });
  });

  it('should reject the request and call deleteAccountById if the verification request is not found', async () => {
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          account_id: 1,
          public_account_id: '818db302-cec8-4fe1-84df-01e2aa505cb6',
          email: 'example@example.com',
          display_name: 'John Doe',
          is_verified: false,
          verification_request_id: null,
          verification_token: null,
          emails_sent: null,
          failed_attempts: null,
        },
      ],
    ]);

    const res = await request(app).patch(endpoint).send({
      publicAccountId: '818db302-cec8-4fe1-84df-01e2aa505cb6',
    });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Account not found.',
      reason: 'accountNotFound',
    });

    expect(accountDbHelpers.deleteAccountById).toHaveBeenCalledExactlyOnceWith(
      1,
      expect.any(Object),
      expect.any(Object)
    );
  });

  it('should reject the request and call deleteAccountById if all the verification attempts have been exhausted', async () => {
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          account_id: 1,
          public_account_id: '818db302-cec8-4fe1-84df-01e2aa505cb6',
          email: 'example@example.com',
          display_name: 'John Doe',
          is_verified: false,
          verification_request_id: 1,
          verification_token: 'someVerificationToken',
          emails_sent: 1,
          failed_attempts: ACCOUNT_FAILED_ATTEMPTS_LIMIT,
        },
      ],
    ]);

    const res = await request(app).patch(endpoint).send({
      publicAccountId: '818db302-cec8-4fe1-84df-01e2aa505cb6',
    });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Account not found.',
      reason: 'accountNotFound',
    });

    expect(accountDbHelpers.deleteAccountById).toHaveBeenCalledExactlyOnceWith(
      1,
      expect.any(Object),
      expect.any(Object)
    );
  });

  it('should reject the request if the emails sent limit has been reached', async () => {
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          account_id: 1,
          public_account_id: '818db302-cec8-4fe1-84df-01e2aa505cb6',
          email: 'example@example.com',
          display_name: 'John Doe',
          is_verified: false,
          verification_request_id: 1,
          verification_token: 'someVerificationToken',
          emails_sent: ACCOUNT_EMAILS_SENT_LIMIT,
          failed_attempts: 0,
        },
      ],
    ]);

    const res = await request(app).patch(endpoint).send({
      publicAccountId: '818db302-cec8-4fe1-84df-01e2aa505cb6',
    });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(403);
    expect(res.body).toStrictEqual({
      message: 'Sent verification emails limit reached.',
      reason: 'emailsSentLimitReached',
    });
  });

  it('should resolve the request, and call both incrementAccountRequestEmailsSent and sendAccountVerificationEmailService', async () => {
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          account_id: 1,
          public_account_id: '818db302-cec8-4fe1-84df-01e2aa505cb6',
          email: 'example@example.com',
          display_name: 'John Doe',
          is_verified: false,
          verification_request_id: 1,
          verification_token: 'someVerificationToken',
          emails_sent: 1,
          failed_attempts: 0,
        },
      ],
    ]);

    const res = await request(app).patch(endpoint).send({
      publicAccountId: '818db302-cec8-4fe1-84df-01e2aa505cb6',
    });

    expect(mockConnection.commit).toHaveBeenCalledOnce();
    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({});

    expect(accountDbHelpers.incrementAccountRequestEmailsSent).toHaveBeenCalledExactlyOnceWith(
      'account_verification',
      1,
      mockConnection,
      expect.any(Object)
    );

    expect(emailServices.sendAccountVerificationEmailService).toHaveBeenCalledExactlyOnceWith({
      receiver: 'example@example.com',
      displayName: 'John Doe',
      publicAccountId: '818db302-cec8-4fe1-84df-01e2aa505cb6',
      verificationToken: 'someVerificationToken',
    });
  });

  it('should reject the request if an unexpected error occurs and log it', async () => {
    const unexpectedError: Error = new Error('someUnexpectedError');

    vi.mocked(mockConnection.execute).mockImplementationOnce(() => {
      throw unexpectedError;
    });

    const res = await request(app).patch(endpoint).send({
      publicAccountId: '818db302-cec8-4fe1-84df-01e2aa505cb6',
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

describe('PATCH /verification/confirm', () => {
  const endpoint: string = '/api/accounts/verification/confirm';

  it('should reject the request if the user is signed in', async () => {
    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=someAuthSessionId')
      .send({});

    expect(res.status).toBe(403);
    expect(res.body).toStrictEqual({
      message: 'You must sign out before proceeding.',
      reason: 'signedIn',
    });
  });

  it('should reject the request if its body contains extra keys or does not contain all expected keys', async () => {
    const reqBody1 = {};
    const reqBody2 = { someOtherValue: 23 };
    const reqBody3 = {
      publicAccountId: 'somePublicAccountId',
      verificationToken: 'someVerificationToken',
      someOtherValue: 23,
    };

    const res1 = await request(app).patch(endpoint).send(reqBody1);
    const res2 = await request(app).patch(endpoint).send(reqBody2);
    const res3 = await request(app).patch(endpoint).send(reqBody3);

    expect(res1.status).toBe(400);
    expect(res2.status).toBe(400);
    expect(res3.status).toBe(400);

    expect(res1.body).toStrictEqual({ message: 'Invalid request data.' });
    expect(res2.body).toStrictEqual({ message: 'Invalid request data.' });
    expect(res3.body).toStrictEqual({ message: 'Invalid request data.' });
  });

  it('should reject the request if an invalid public account ID is provided', async () => {
    const res = await request(app).patch(endpoint).send({
      publicAccountId: 'someInvalidPublicAccountId',
      verificationToken: '818db302-cec8-4fe1-84df-01e2aa505cb6',
    });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid account ID.',
      reason: 'invalidPublicAccountId',
    });
  });

  it('should reject the request if an invalid verification token is provided', async () => {
    const res = await request(app).patch(endpoint).send({
      publicAccountId: '818db302-cec8-4fe1-84df-01e2aa505cb6',
      verificationToken: 'someInvalidVerificationToken',
    });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid verification token.',
      reason: 'invalidVerificationToken',
    });
  });

  it('should request a connection, begin a transaction, and release it at the end', async () => {
    await request(app).patch(endpoint).send({
      publicAccountId: '818db302-cec8-4fe1-84df-01e2aa505cb6',
      verificationToken: '818db302-cec8-4fe1-84df-01e2aa505cb7',
    });

    expect(dbPool.getConnection).toHaveBeenCalledOnce();
    expect(mockConnection.beginTransaction).toHaveBeenCalledOnce();
    expect(mockConnection.release).toHaveBeenCalledOnce();
  });

  it('should reject the request if the account is not found', async () => {
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([[]]);

    const res = await request(app).patch(endpoint).send({
      publicAccountId: '818db302-cec8-4fe1-84df-01e2aa505cb6',
      verificationToken: '818db302-cec8-4fe1-84df-01e2aa505cb7',
    });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Account not found.',
      reason: 'accountNotFound',
    });
  });

  it('should reject the request if the account is verified', async () => {
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          account_id: 1,
          is_verified: true,
          verification_request_id: 1,
          verification_token: '818db302-cec8-4fe1-84df-01e2aa505cb7',
          failed_attempts: 0,
        },
      ],
    ]);

    const res = await request(app).patch(endpoint).send({
      publicAccountId: '818db302-cec8-4fe1-84df-01e2aa505cb6',
      verificationToken: '818db302-cec8-4fe1-84df-01e2aa505cb7',
    });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(409);
    expect(res.body).toStrictEqual({
      message: 'Account is already verified.',
      reason: 'alreadyVerified',
    });
  });

  it('should reject the request and call deleteAccountById if the verification request is not found', async () => {
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          account_id: 1,
          is_verified: false,
          verification_request_id: null,
          verification_token: null,
          failed_attempts: null,
        },
      ],
    ]);

    const res = await request(app).patch(endpoint).send({
      publicAccountId: '818db302-cec8-4fe1-84df-01e2aa505cb6',
      verificationToken: '818db302-cec8-4fe1-84df-01e2aa505cb7',
    });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Account not found.',
      reason: 'accountNotFound',
    });

    expect(accountDbHelpers.deleteAccountById).toHaveBeenCalledExactlyOnceWith(
      1,
      expect.any(Object),
      expect.any(Object)
    );
  });

  it('should reject the request and call deleteAccountById if all the verification attempts have been exhausted', async () => {
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          account_id: 1,
          is_verified: false,
          verification_request_id: 1,
          verification_token: '818db302-cec8-4fe1-84df-01e2aa505cb7',
          failed_attempts: ACCOUNT_FAILED_ATTEMPTS_LIMIT,
        },
      ],
    ]);

    const res = await request(app).patch(endpoint).send({
      publicAccountId: '818db302-cec8-4fe1-84df-01e2aa505cb6',
      verificationToken: '818db302-cec8-4fe1-84df-01e2aa505cb7',
    });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Account not found.',
      reason: 'accountNotFound',
    });

    expect(accountDbHelpers.deleteAccountById).toHaveBeenCalledExactlyOnceWith(
      1,
      expect.any(Object),
      expect.any(Object)
    );
  });

  it('should resolve the request if the correct verification token is provided, calling createAuthSession, and returning its result in the response', async () => {
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          account_id: 1,
          is_verified: false,
          verification_request_id: 1,
          verification_token: '818db302-cec8-4fe1-84df-01e2aa505cb7',
          failed_attempts: 0,
        },
      ],
    ]);

    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      {
        affectedRows: 1,
      },
    ]);

    vi.mocked(authSessions.createAuthSession).mockResolvedValueOnce(true);

    const res = await request(app).patch(endpoint).send({
      publicAccountId: '818db302-cec8-4fe1-84df-01e2aa505cb6',
      verificationToken: '818db302-cec8-4fe1-84df-01e2aa505cb7',
    });

    expect(mockConnection.commit).toHaveBeenCalledOnce();
    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      authSessionCreated: true,
    });

    expect(authSessions.createAuthSession).toHaveBeenCalledExactlyOnceWith(
      expect.any(Object),
      mockConnection,
      1,
      false
    );
  });

  it('should reject the request and call deleteAccountById if the verification token is incorrect and all verification attempts have now been exhausted', async () => {
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          account_id: 1,
          is_verified: false,
          verification_request_id: 1,
          verification_token: '818db302-cec8-4fe1-84df-01e2aa505cb7',
          failed_attempts: ACCOUNT_FAILED_ATTEMPTS_LIMIT - 1,
        },
      ],
    ]);

    const res = await request(app).patch(endpoint).send({
      publicAccountId: '818db302-cec8-4fe1-84df-01e2aa505cb6',
      verificationToken: '818db302-cec8-4fe1-84df-01e2aa505cb0',
    });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Incorrect verification token.',
      reason: 'incorrectVerificationToken_deleted',
    });

    expect(accountDbHelpers.deleteAccountById).toHaveBeenCalledExactlyOnceWith(
      1,
      expect.any(Object),
      expect.any(Object)
    );
  });

  it('should reject the request and call incrementFailedAccountRequestAttempts if the verification token is incorrect', async () => {
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          account_id: 1,
          is_verified: false,
          verification_request_id: 1,
          verification_token: '818db302-cec8-4fe1-84df-01e2aa505cb7',
          failed_attempts: 0,
        },
      ],
    ]);

    const res = await request(app).patch(endpoint).send({
      publicAccountId: '818db302-cec8-4fe1-84df-01e2aa505cb6',
      verificationToken: '818db302-cec8-4fe1-84df-01e2aa505cb0',
    });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Incorrect verification token.',
      reason: 'incorrectVerificationToken',
    });

    expect(
      accountDbHelpers.incrementFailedAccountRequestAttempts
    ).toHaveBeenCalledExactlyOnceWith('account_verification', 1, dbPool, expect.any(Object));
  });

  it('should reject the request if an unexpected error occurs and log it', async () => {
    const unexpectedError: Error = new Error('someUnexpectedError');

    vi.mocked(mockConnection.execute).mockImplementationOnce(() => {
      throw unexpectedError;
    });

    const res = await request(app).patch(endpoint).send({
      publicAccountId: '818db302-cec8-4fe1-84df-01e2aa505cb6',
      verificationToken: '818db302-cec8-4fe1-84df-01e2aa505cb7',
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

describe('POST /signIn', () => {
  const endpoint: string = '/api/accounts/signIn';

  it('should reject the request if the user is signed in', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=someAuthSessionId')
      .send({});

    expect(res.status).toBe(403);
    expect(res.body).toStrictEqual({
      message: 'Already signed in.',
      reason: 'alreadySignedIn',
    });
  });

  it('should reject the request if its body contains extra keys or does not contain all expected keys', async () => {
    const reqBody1 = {};
    const reqBody2 = { someOtherValue: 23 };
    const reqBody3 = {
      email: 'example@example.com',
      password: 'somePassword',
      keepSignedIn: false,
      someOtherValue: 23,
    };

    const res1 = await request(app).post(endpoint).send(reqBody1);
    const res2 = await request(app).post(endpoint).send(reqBody2);
    const res3 = await request(app).post(endpoint).send(reqBody3);

    expect(res1.status).toBe(400);
    expect(res2.status).toBe(400);
    expect(res3.status).toBe(400);

    expect(res1.body).toStrictEqual({ message: 'Invalid request data.' });
    expect(res2.body).toStrictEqual({ message: 'Invalid request data.' });
    expect(res3.body).toStrictEqual({ message: 'Invalid request data.' });
  });

  it('should reject the request if an invalid email is provided', async () => {
    const res = await request(app).post(endpoint).send({
      email: 'invalid email',
      password: 'somePassword',
      keepSignedIn: false,
    });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid email.',
      reason: 'invalidEmail',
    });
  });

  it('should reject the request if an invalid password is provided', async () => {
    const res = await request(app).post(endpoint).send({
      email: 'example@example.com',
      password: 'invalid password',
      keepSignedIn: false,
    });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid password.',
      reason: 'invalidPassword',
    });
  });

  it('should request a connection, begin a transaction, and release it at the end', async () => {
    await request(app).post(endpoint).send({
      email: 'example@example.com',
      password: 'somePassword',
      keepSignedIn: false,
    });

    expect(dbPool.getConnection).toHaveBeenCalledOnce();
    expect(mockConnection.beginTransaction).toHaveBeenCalledOnce();
    expect(mockConnection.release).toHaveBeenCalledOnce();
  });

  it('should reject the request if the account is not found', async () => {
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([[]]);

    const res = await request(app).post(endpoint).send({
      email: 'example@example.com',
      password: 'somePassword',
      keepSignedIn: false,
    });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Account not found or is unverified.',
      reason: 'accountNotFound',
    });
  });

  it('should reject the request if the account is unverified', async () => {
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          account_id: 1,
          hashed_password: 'someHashedPassword',
          is_verified: false,
          failed_sign_in_attempts: 0,
        },
      ],
    ]);

    const res = await request(app).post(endpoint).send({
      email: 'example@example.com',
      password: 'somePassword',
      keepSignedIn: false,
    });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Account not found or is unverified.',
      reason: 'accountNotFound',
    });
  });

  it('should reject the request if the failed sign in attempts limit has been reached', async () => {
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          account_id: 1,
          hashed_password: 'someHashedPassword',
          is_verified: true,
          failed_sign_in_attempts: ACCOUNT_FAILED_SIGN_IN_LIMIT,
        },
      ],
    ]);

    const res = await request(app).post(endpoint).send({
      email: 'example@example.com',
      password: 'somePassword',
      keepSignedIn: false,
    });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(403);
    expect(res.body).toStrictEqual({
      message: 'Account is locked.',
      reason: 'accountLocked',
    });
  });

  it('should reject the request if the password provided is incorrect and call handleIncorrectPassword', async () => {
    vi.mocked(bcrypt.compare).mockResolvedValueOnce(false as any);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          account_id: 1,
          hashed_password: 'someHashedPassword',
          is_verified: true,
          failed_sign_in_attempts: 0,
        },
      ],
    ]);

    const res = await request(app).post(endpoint).send({
      email: 'example@example.com',
      password: 'somePassword',
      keepSignedIn: false,
    });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Incorrect password.',
      reason: 'incorrectPassword',
    });

    expect(accountDbHelpers.handleIncorrectPassword).toHaveBeenCalledExactlyOnceWith(
      1,
      0,
      dbPool,
      expect.any(Object),
      expect.any(Object)
    );
  });

  it('should call createAuthSession if the password is correct, but reject the request if an auth session is not created', async () => {
    vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as any);
    vi.mocked(authSessions.createAuthSession).mockResolvedValueOnce(false);

    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          account_id: 1,
          hashed_password: 'someHashedPassword',
          is_verified: true,
          failed_sign_in_attempts: 0,
        },
      ],
    ]);

    const res = await request(app).post(endpoint).send({
      email: 'example@example.com',
      password: 'somePassword',
      keepSignedIn: false,
    });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(500);
    expect(res.body).toStrictEqual({
      message: 'Internal server error.',
    });

    expect(authSessions.createAuthSession).toHaveBeenCalledExactlyOnceWith(
      expect.any(Object),
      mockConnection,
      1,
      false
    );
    expect(errorLogger.logUnexpectedError).toHaveBeenCalledExactlyOnceWith(
      expect.any(Object),
      null,
      'Failed to create authSession.'
    );
  });

  it('should resolve the request if the password is correct and an auth session is created, calling resetFailedSignInAttempts if failed sign in attempts are above 0', async () => {
    vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as any);
    vi.mocked(authSessions.createAuthSession).mockResolvedValueOnce(true);

    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          account_id: 1,
          hashed_password: 'someHashedPassword',
          is_verified: true,
          failed_sign_in_attempts: 1,
        },
      ],
    ]);

    const res = await request(app).post(endpoint).send({
      email: 'example@example.com',
      password: 'somePassword',
      keepSignedIn: false,
    });

    expect(mockConnection.commit).toHaveBeenCalledOnce();
    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({});

    expect(accountDbHelpers.resetFailedSignInAttempts).toHaveBeenCalledExactlyOnceWith(
      1,
      dbPool,
      expect.any(Object)
    );
  });

  it('should reject the request if an unexpected error occurs and log it', async () => {
    const unexpectedError: Error = new Error('someUnexpectedError');

    vi.mocked(mockConnection.execute).mockImplementationOnce(() => {
      throw unexpectedError;
    });

    const res = await request(app).post(endpoint).send({
      email: 'example@example.com',
      password: 'somePassword',
      keepSignedIn: false,
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

describe('GET /', () => {
  const endpoint: string = '/api/accounts';

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

  it('should reject the request if the account is not found', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.query).mockResolvedValueOnce([[], []]);

    const res = await request(app)
      .get(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Account not found.',
      reason: 'accountNotFound',
    });
  });

  it(`should resolve the request and return the account's details, converting binary-based boolean into true/false booleans`, async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    const accountDetails = {
      public_account_id: 'somePublicAccountId',
      email: 'example@example.com',
      username: 'johnDoe',
      display_name: 'John Doe',
      created_on_timestamp: 1.77e12,
      is_private: true,
      approve_follow_requests: true,
      followers_count: 0,
      following_count: 0,
      wishlists_count: 0,
    };

    const ongoingEmailUpdateRequest = {
      request_id: 1,
      new_email: 'new@example.com',
      is_suspended: 0,
      expiry_timestamp: 1.771e12,
    };

    const ongoingAccountDeletionRequest = {
      request_id: 1,
      is_suspended: 0,
      expiry_timestamp: 1.771e12,
    };

    vi.mocked(dbPool.query).mockResolvedValueOnce([
      [
        [{ ...accountDetails }],
        [{ ...ongoingEmailUpdateRequest }],
        [{ ...ongoingAccountDeletionRequest }],
      ] as any,
      [],
    ]);

    const res = await request(app)
      .get(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6');

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      accountDetails,
      ongoingEmailUpdateRequest: { ...ongoingEmailUpdateRequest, is_suspended: false },
      ongoingAccountDeletionRequest: { ...ongoingAccountDeletionRequest, is_suspended: false },
    });
  });

  it('should reject the request if an unexpected error occurs and log it', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    const unexpectedError: Error = new Error('someUnexpectedError');

    vi.mocked(dbPool.query).mockImplementationOnce(() => {
      throw unexpectedError;
    });

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

describe('GET /:publicAccountId', () => {
  function setEndpoint(publicAccountId: string): string {
    return `/api/accounts/${publicAccountId}`;
  }

  it('should reject the request if it does not contain an publicAccountId parameter', async () => {
    const res = await request(app).get(setEndpoint('someInvalidPublicAccountId'));

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid account ID.',
      reason: 'invalidPublicAccountId',
    });
  });

  it('should reject the request if the account is not found', async () => {
    vi.mocked(dbPool.execute).mockResolvedValueOnce([[], []]);

    const res = await request(app).get(setEndpoint('818db302-cec8-4fe1-84df-01e2aa505cb9'));

    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Account not found.',
      reason: 'accountNotFound',
    });
  });

  it('should reject the request if the requester is the account owner', async () => {
    const viewAccountDetails = {
      public_account_id: '818db302-cec8-4fe1-84df-01e2aa505cb9',
      username: 'johnDoe',
      display_name: 'John Doe',
      created_on_timestamp: 1.77e12,
      is_private: true,
      approve_follow_requests: true,
      is_owner: 1,

      follow_id: null,
      follow_request_id: null,

      followers_count: 0,
      following_count: 0,
    };

    vi.mocked(dbPool.execute).mockResolvedValueOnce([[{ ...viewAccountDetails } as any], []]);

    const res = await request(app).get(setEndpoint('818db302-cec8-4fe1-84df-01e2aa505cb9'));

    expect(res.status).toBe(409);
    expect(res.body).toStrictEqual({
      message: 'Account owner.',
      reason: 'accountOwner',
    });
  });

  it('should resolve the request and send back the account details', async () => {
    const viewAccountDetails = {
      public_account_id: '818db302-cec8-4fe1-84df-01e2aa505cb9',
      username: 'johnDoe',
      display_name: 'John Doe',
      created_on_timestamp: 1.77e12,
      is_private: true,
      approve_follow_requests: true,
      is_owner: 0,

      follow_id: null,
      follow_request_id: null,

      followers_count: 0,
      following_count: 0,
    };

    vi.mocked(dbPool.execute).mockResolvedValueOnce([[{ ...viewAccountDetails } as any], []]);

    const res = await request(app).get(setEndpoint('818db302-cec8-4fe1-84df-01e2aa505cb9'));

    const { is_owner, ...rest } = viewAccountDetails;

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({ viewAccountDetails: rest });
  });

  it('should reject the request if an unexpected error occurs and log it', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    const unexpectedError: Error = new Error('someUnexpectedError');

    vi.mocked(dbPool.execute).mockImplementationOnce(() => {
      throw unexpectedError;
    });

    const res = await request(app).get(setEndpoint('818db302-cec8-4fe1-84df-01e2aa505cb9'));

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

describe('PATCH /details/privacy', () => {
  const endpoint: string = '/api/accounts/details/privacy';

  it('should reject the request if it does not contain an authSessionId cookie', async () => {
    const res = await request(app).patch(endpoint).send({
      isPrivate: false,
      approveFollowRequests: false,
    });

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
      .send({
        isPrivate: false,
        approveFollowRequests: false,
      });

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
      isPrivate: false,
      approveFollowRequests: false,
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

  it('should reject the request if the user attempts to set up an invalid privacy configuration', async () => {
    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        isPrivate: true,
        approveFollowRequests: false,
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid privacy configuration.',
      reason: 'invalidConfiguration',
    });
  });

  it('should reject the request and log an error if the server fails to update the database', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      {
        affectedRows: 0,
      } as any,
      [],
    ]);

    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        isPrivate: false,
        approveFollowRequests: false,
      });

    expect(res.status).toBe(500);
    expect(res.body).toStrictEqual({ message: 'Internal server error.' });

    expect(errorLogger.logUnexpectedError).toHaveBeenCalledExactlyOnceWith(
      expect.any(Object),
      null,
      'Failed to update is_private and approve_follow_requests.'
    );
  });

  it('should resolve the request if a valid configuration is provided and the database is successfully updated', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
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
        isPrivate: false,
        approveFollowRequests: false,
      });

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
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        isPrivate: false,
        approveFollowRequests: false,
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

describe('PATCH /details/displayName', () => {
  const endpoint: string = '/api/accounts/details/displayName';

  it('should reject the request if it does not contain an authSessionId cookie', async () => {
    const res = await request(app).patch(endpoint).send({
      newDisplayName: 'Sara Smith',
    });

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
      .send({
        newDisplayName: 'Sara Smith',
      });

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
      newDisplayName: 'Sara Smith',
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

  it('should reject the request if an invalid display name is provided', async () => {
    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        newDisplayName: '!nvalid name 23',
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid display name.',
      reason: 'invalidDisplayName',
    });
  });

  it('should reject the request if the account is not found', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([[], []]);

    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        newDisplayName: 'Sara Smith',
      });

    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Account not found.',
      reason: 'accountNotFound',
    });
  });

  it('should reject the request if the new display name is identical to the existing one', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          display_name: 'Sara Smith',
        } as any,
      ],
      [],
    ]);

    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        newDisplayName: 'Sara Smith',
      });

    expect(res.status).toBe(409);
    expect(res.body).toStrictEqual({
      message: 'Account already has this display name.',
      reason: 'duplicateDisplayName',
    });
  });

  it('should reject the request and log an error if the server fails to update the database', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          display_name: 'Sara Smith',
        } as any,
      ],
      [],
    ]);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      {
        affectedRows: 0,
      } as any,
      [],
    ]);

    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        newDisplayName: 'John Doe',
      });

    expect(res.status).toBe(500);
    expect(res.body).toStrictEqual({ message: 'Internal server error.' });

    expect(errorLogger.logUnexpectedError).toHaveBeenCalledExactlyOnceWith(
      expect.any(Object),
      null,
      'Failed to update display_name.'
    );
  });

  it('should resolve the request if a valid new display name is provided and the database is successfully updated', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(dbPool.execute).mockResolvedValueOnce([
      [
        {
          display_name: 'Sara Smith',
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
        newDisplayName: 'John Doe',
      });

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
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        newDisplayName: 'John Doe',
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

describe('PATCH /details/password', () => {
  const endpoint: string = '/api/accounts/details/password';

  it('should reject the request if it does not contain an authSessionId cookie', async () => {
    const res = await request(app).patch(endpoint).send({
      password: 'somePassword',
      newPassword: 'someNewPassword',
    });

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
      .send({
        password: 'somePassword',
        newPassword: 'someNewPassword',
      });

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
      password: 'somePassword',
      newPassword: 'someNewPassword',
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

  it('should reject the request if an invalid password is provided', async () => {
    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        password: 'invalid password',
        newPassword: 'someNewPassword',
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid current password.',
      reason: 'invalidCurrentPassword',
    });
  });

  it('should reject the request if an invalid new password is provided', async () => {
    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        password: 'somePassword',
        newPassword: 'invalid new password',
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid new password.',
      reason: 'invalidNewPassword',
    });
  });

  it('should request a connection, begin a transaction, and release it at the end', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        password: 'somePassword',
        newPassword: 'someNewPassword',
      });

    expect(dbPool.getConnection).toHaveBeenCalledOnce();
    expect(mockConnection.beginTransaction).toHaveBeenCalledOnce();
    expect(mockConnection.release).toHaveBeenCalledOnce();
  });

  it('should reject the request if the account is not found', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([[]]);

    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        password: 'somePassword',
        newPassword: 'someNewPassword',
      });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Account not found.',
      reason: 'accountNotFound',
    });
  });

  it('should reject the request if the new password is identical to the username', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          username: 'johnDoe123',
          hashed_password: 'someHashedPassword',
          failed_sign_in_attempts: 0,
        },
      ],
    ]);

    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        password: 'somePassword',
        newPassword: 'johnDoe123',
      });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(409);
    expect(res.body).toStrictEqual({
      message: `Username and password can't match.`,
      reason: 'newPasswordMatchesUsername',
    });
  });

  it('should reject the request if the password provided is incorrect and call handleIncorrectPassword', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          username: 'johnDoe',
          hashed_password: 'someHashedPassword',
          failed_sign_in_attempts: 0,
        },
      ],
    ]);

    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        password: 'somePassword',
        newPassword: 'someNewPassword',
      });

    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Incorrect password.',
      reason: 'incorrectPassword',
    });

    expect(accountDbHelpers.handleIncorrectPassword).toHaveBeenCalledExactlyOnceWith(
      1,
      0,
      dbPool,
      expect.any(Object),
      expect.any(Object)
    );
  });

  it('should reject the request if new password is identical to the existing one', async () => {
    vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as any);
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          username: 'johnDoe',
          hashed_password: 'someHashedPassword',
          failed_sign_in_attempts: 0,
        },
      ],
    ]);

    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        password: 'somePassword',
        newPassword: 'somePassword',
      });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(409);
    expect(res.body).toStrictEqual({
      message: `New password can't match current password.`,
      reason: 'newPasswordMatchesUsername',
    });
  });

  it('should reject the request and log an error if the server fails to update the database', async () => {
    vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as any);
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          username: 'johnDoe',
          hashed_password: 'someHashedPassword',
          failed_sign_in_attempts: 0,
        },
      ],
    ]);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      {
        affectedRows: 0,
      },
    ]);

    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        password: 'somePassword',
        newPassword: 'someNewPassword',
      });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(500);
    expect(res.body).toStrictEqual({
      message: 'Internal server error.',
    });

    expect(errorLogger.logUnexpectedError).toHaveBeenCalledExactlyOnceWith(
      expect.any(Object),
      null,
      'Failed to update hashed_password.'
    );
  });

  it('should resolve the request if the password is correct, the new password is valid, and the database is successfully updated, calling purgeAuthSessions, as well as calling resetFailedSignInAttempts if the failed sign in attempts are greater than 0', async () => {
    vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as any);
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          username: 'johnDoe',
          hashed_password: 'someHashedPassword',
          failed_sign_in_attempts: 1,
        },
      ],
    ]);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      {
        affectedRows: 1,
      },
    ]);

    const res = await request(app)
      .patch(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        password: 'somePassword',
        newPassword: 'someNewPassword',
      });

    expect(mockConnection.commit).toHaveBeenCalledOnce();
    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({});

    expect(authSessions.purgeAuthSessions).toHaveBeenCalledExactlyOnceWith(
      1,
      '818db302-cec8-4fe1-84df-01e2aa505cb6'
    );
    expect(accountDbHelpers.resetFailedSignInAttempts).toHaveBeenCalledExactlyOnceWith(
      1,
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
        password: 'somePassword',
        newPassword: 'someNewPassword',
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

describe('POST /details/email/start', () => {
  const endpoint: string = '/api/accounts/details/email/start';

  it('should reject the request if it does not contain an authSessionId cookie', async () => {
    const res = await request(app).post(endpoint).send({
      newEmail: 'new@example.com',
      password: 'somePassword',
    });

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
      .send({
        newEmail: 'new@example.com',
        password: 'somePassword',
      });

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
      newEmail: 'new@example.com',
      password: 'somePassword',
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

  it('should reject the request if an invalid email is provided', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        newEmail: 'invalid email',
        password: 'somePassword',
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid email address.',
      reason: 'invalidEmail',
    });
  });

  it('should reject the request if an invalid password is provided', async () => {
    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        newEmail: 'new@example.com',
        password: 'invalid password',
      });

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({
      message: 'Invalid password.',
      reason: 'invalidPassword',
    });
  });

  it('should request a connection, begin a transaction, and release it at the end', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);

    await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        newEmail: 'new@example.com',
        password: 'somePassword',
      });

    expect(dbPool.getConnection).toHaveBeenCalledOnce();
    expect(mockConnection.beginTransaction).toHaveBeenCalledOnce();
    expect(mockConnection.release).toHaveBeenCalledOnce();
  });

  it('should reject the request if the account is not found', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([[]]);

    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        newEmail: 'new@example.com',
        password: 'somePassword',
      });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: 'Account not found.',
      reason: 'accountNotFound',
    });
  });

  it('should reject the request if the password provided is incorrect and call handleIncorrectPassword', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(bcrypt.compare).mockResolvedValueOnce(false as any);

    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          email: 'example@example.com',
          hashed_password: 'someHashedPassword',
          display_name: 'John Doe',
          failed_sign_in_attempts: 0,

          request_id: null,
          new_email: null,
          expiry_timestamp: null,
          failed_attempts: null,

          email_taken: 0,
          email_temporarily_taken: 0,
        },
      ],
    ]);

    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        newEmail: 'new@example.com',
        password: 'somePassword',
      });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(401);
    expect(res.body).toStrictEqual({
      message: 'Incorrect password.',
      reason: 'incorrectPassword',
    });

    expect(accountDbHelpers.handleIncorrectPassword).toHaveBeenCalledExactlyOnceWith(
      1,
      0,
      dbPool,
      expect.any(Object),
      expect.any(Object)
    );
  });

  it('should reject the request if an existing email update request is found', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as any);

    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          email: 'example@example.com',
          hashed_password: 'someHashedPassword',
          display_name: 'John Doe',
          failed_sign_in_attempts: 0,

          request_id: 1,
          new_email: 'new@example.com',
          expiry_timestamp: 1.772e12,
          failed_attempts: 0,

          email_taken: 0,
          email_temporarily_taken: 0,
        },
      ],
    ]);

    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        newEmail: 'new@example.com',
        password: 'somePassword',
      });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(409);
    expect(res.body).toStrictEqual({
      message: 'Ongoing email change request found.',
      reason: 'ongoingRequest',
      resData: {
        new_email: 'new@example.com',
        expiry_timestamp: 1.772e12,
        is_suspended: false,
      },
    });
  });

  it('should reject the request if the new email is identical to the existing one', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as any);

    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          email: 'example@example.com',
          hashed_password: 'someHashedPassword',
          display_name: 'John Doe',
          failed_sign_in_attempts: 0,

          request_id: null,
          new_email: null,
          expiry_timestamp: null,
          failed_attempts: null,

          email_taken: 0,
          email_temporarily_taken: 0,
        },
      ],
    ]);

    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        newEmail: 'example@example.com',
        password: 'somePassword',
      });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(409);
    expect(res.body).toStrictEqual({
      message: 'Email already linked to this account.',
      reason: 'duplicateEmail',
    });
  });

  it('should reject the request if the new email is taken', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as any);

    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          email: 'example@example.com',
          hashed_password: 'someHashedPassword',
          display_name: 'John Doe',
          failed_sign_in_attempts: 0,

          request_id: null,
          new_email: null,
          expiry_timestamp: null,
          failed_attempts: null,

          email_taken: 1,
          email_temporarily_taken: 0,
        },
      ],
    ]);

    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        newEmail: 'example@example.com',
        password: 'somePassword',
      });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(409);
    expect(res.body).toStrictEqual({
      message: 'Email already linked to this account.',
      reason: 'duplicateEmail',
    });
  });

  vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
  it('should resolve the request, call sendEmailUpdateStartEmailService, as well as call resetFailedSignInAttempts if the failed sign in attempts are greater than 0', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as any);

    vi.mocked(mockConnection.execute).mockResolvedValueOnce([
      [
        {
          email: 'example@example.com',
          hashed_password: 'someHashedPassword',
          display_name: 'John Doe',
          failed_sign_in_attempts: 1,

          request_id: null,
          new_email: null,
          expiry_timestamp: null,
          failed_attempts: null,

          email_taken: 0,
          email_temporarily_taken: 0,
        },
      ],
    ]);
    vi.mocked(mockConnection.execute).mockResolvedValueOnce([[]]);

    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        newEmail: 'new@example.com',
        password: 'somePassword',
      });

    expect(mockConnection.commit).toHaveBeenCalledOnce();
    expect(res.status).toBe(201);
    expect(res.body).toStrictEqual({
      expiryTimestamp: expect.any(Number),
    });

    expect(emailServices.sendEmailUpdateStartEmailService).toHaveBeenCalledExactlyOnceWith({
      receiver: 'new@example.com',
      confirmationCode: expect.any(String),
      displayName: 'John Doe',
    });
    expect(accountDbHelpers.resetFailedSignInAttempts).toHaveBeenCalledExactlyOnceWith(
      1,
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
        newEmail: 'new@example.com',
        password: 'somePassword',
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

  it('should reject the request if an SqlError is thrown indicating that the email is taken', async () => {
    vi.mocked(authDbHelpers.getAccountIdByAuthSessionId).mockResolvedValueOnce(1);
    vi.mocked(isSqlError.isSqlError).mockReturnValueOnce(true);

    const unexpectedError = {
      errno: 1062,
      sqlMessage: `Duplicate entry for key 'new_email'`,
    };

    vi.mocked(mockConnection.execute).mockImplementationOnce(() => {
      throw unexpectedError;
    });

    const res = await request(app)
      .post(endpoint)
      .set('Cookie', 'authSessionId=818db302-cec8-4fe1-84df-01e2aa505cb6')
      .send({
        newEmail: 'new@example.com',
        password: 'somePassword',
      });

    expect(mockConnection.rollback).toHaveBeenCalledOnce();
    expect(res.status).toBe(409);
    expect(res.body).toStrictEqual({
      message: 'Email is taken.',
      reason: 'emailTaken',
    });
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
        newEmail: 'new@example.com',
        password: 'somePassword',
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
