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
} from '../util/constants/accountConstants';
import * as accountDbHelpers from '../db/helpers/accountDbHelpers';
import * as errorLogger from '../logs/errorLogger';

vi.mock('../util/validation/userValidation', { spy: true });
vi.mock('../util/email/emailServices');
vi.mock('../db/helpers/accountDbHelpers');
vi.mock('../logs/errorLogger');

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
        password: 'somePAssword',
        displayName: 'John Doe',
      });

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
        password: 'somePAssword',
        displayName: 'John Doe',
      });

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
        password: 'somePAssword',
        displayName: 'John Doe',
      });

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
        password: 'somePAssword',
        displayName: 'John Doe',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('publicAccountId');
    expect(res.body.publicAccountId).toBeTypeOf('string');

    expect(emailServices.sendAccountVerificationEmailService).toHaveBeenCalledOnce();
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

  it('should request a connection and begin a transaction', async () => {
    await request(app).patch(endpoint).send({
      publicAccountId: '818db302-cec8-4fe1-84df-01e2aa505cb6',
    });

    expect(dbPool.getConnection).toHaveBeenCalledOnce();
    expect(mockConnection.beginTransaction).toHaveBeenCalledOnce();
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
          is_verified: 1,
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
          is_verified: 0,
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
          is_verified: 0,
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
          is_verified: 0,
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
          is_verified: 0,
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

  it('should reject the request if an expected error occurs and log it', async () => {
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
