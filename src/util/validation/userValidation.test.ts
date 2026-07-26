import { describe, expect, it } from 'vitest';
import {
  isValidDateOfBirthTimestamp,
  isValidDisplayName,
  isValidEmail,
  isValidNewPassword,
  isValidPassword,
  isValidUsername,
} from './userValidation';
import { dayMilliseconds } from '../constants/globalConstants';

describe('isValidEmail', () => {
  it('should return false if the value is not a string', async () => {
    const result1 = isValidEmail(23);
    const result2 = isValidEmail({});
    const result3 = isValidEmail([]);

    expect(result1).toBe(false);
    expect(result2).toBe(false);
    expect(result3).toBe(false);
  });

  it('should return false if an invalid email is provided (meant to be somewhat lenient, as true validation is done through the verification process)', async () => {
    const result1 = isValidEmail('invalid email');
    const result2 = isValidEmail('invalid.com');
    const result3 = isValidEmail('invalid@invalid');

    expect(result1).toBe(false);
    expect(result2).toBe(false);
    expect(result3).toBe(false);
  });

  it('should return true if a valid email is provided (meant to be somewhat lenient, as true validation is done through the verification process)', async () => {
    const result1 = isValidEmail('valid@example.com');
    const result2 = isValidEmail('valid@valid.co.uk');
    const result3 = isValidEmail('anotherExample-valid@example.come');

    expect(result1).toBe(true);
    expect(result2).toBe(true);
    expect(result3).toBe(true);
  });
});

describe('isValidNewPassword', () => {
  it('should return false if the value is not a string', async () => {
    const result1 = isValidNewPassword(23);
    const result2 = isValidNewPassword({});
    const result3 = isValidNewPassword([]);

    expect(result1).toBe(false);
    expect(result2).toBe(false);
    expect(result3).toBe(false);
  });

  it('should return false if the password length is shorter than 8 characters', async () => {
    const result1 = isValidNewPassword('a');
    const result2 = isValidNewPassword('a'.repeat(4));
    const result3 = isValidNewPassword('a'.repeat(7));

    expect(result1).toBe(false);
    expect(result2).toBe(false);
    expect(result3).toBe(false);
  });

  it('should return false if the password length is longer than 40 characters', async () => {
    const result = isValidNewPassword('a'.repeat(41));
    expect(result).toBe(false);
  });

  it('should return false if non-allowed characters are provided', async () => {
    const result1 = isValidNewPassword('invalid password');
    const result2 = isValidNewPassword('invalidPassword []{}');
    const result3 = isValidNewPassword('invalidPassword\\\\////');

    expect(result1).toBe(false);
    expect(result2).toBe(false);
    expect(result3).toBe(false);
  });

  it('should return true if a valid password is provided', async () => {
    const result1 = isValidNewPassword('validPassword');
    const result2 = isValidNewPassword('valid123_.!#$&');

    expect(result1).toBe(true);
    expect(result2).toBe(true);
  });
});

describe('isValidPassword', () => {
  it('should return false if the value is not a string', async () => {
    const result1 = isValidPassword(23);
    const result2 = isValidPassword({});
    const result3 = isValidPassword([]);

    expect(result1).toBe(false);
    expect(result2).toBe(false);
    expect(result3).toBe(false);
  });

  it('should return false if the password contains any whitespace', async () => {
    const result1 = isValidPassword('some password');
    const result2 = isValidPassword('some\npassword');

    expect(result1).toBe(false);
    expect(result2).toBe(false);
  });

  it('should return false if the password length is longer than 40 characters', async () => {
    const result = isValidPassword('a'.repeat(41));
    expect(result).toBe(false);
  });

  it('should return true if a valid password is provided (meant to be lenient)', async () => {
    const result = isValidPassword('pass');
    expect(result).toBe(true);
  });
});

describe('isValidUsername', () => {
  it('should return false if the value is not a string', async () => {
    const result1 = isValidUsername(23);
    const result2 = isValidUsername({});
    const result3 = isValidUsername([]);

    expect(result1).toBe(false);
    expect(result2).toBe(false);
    expect(result3).toBe(false);
  });

  it('should return false if the username length is shorter than 5 characters', async () => {
    const result1 = isValidUsername('a');
    const result2 = isValidUsername('aa');
    const result3 = isValidUsername('aaaa');

    expect(result1).toBe(false);
    expect(result2).toBe(false);
    expect(result3).toBe(false);
  });

  it('should return false if the username length is longer than 25 characters', async () => {
    const result = isValidUsername('a'.repeat(26));
    expect(result).toBe(false);
  });

  it('should return false if non-allowed characters are provided', async () => {
    const result1 = isValidUsername('invalid username');
    const result2 = isValidUsername('invalidUsername []{}');
    const result3 = isValidUsername('invalidUsername\\\\////');

    expect(result1).toBe(false);
    expect(result2).toBe(false);
    expect(result3).toBe(false);
  });

  it('should return true if a valid username is provided', async () => {
    const result1 = isValidUsername('validUSername');
    const result2 = isValidUsername('valid123_.');

    expect(result1).toBe(true);
    expect(result2).toBe(true);
  });
});

describe('isValidDisplayName', () => {
  it('should return false if the value is not a string', () => {
    const result1 = isValidDisplayName(23);
    const result2 = isValidDisplayName({});
    const result3 = isValidDisplayName([]);

    expect(result1).toBe(false);
    expect(result2).toBe(false);
    expect(result3).toBe(false);
  });

  it('should return false if value contains invalid whitespace', () => {
    const result1 = isValidDisplayName(' John Doe');
    const result2 = isValidDisplayName('John Doe ');
    const result3 = isValidDisplayName(' John Doe ');

    expect(result1).toBe(false);
    expect(result2).toBe(false);
    expect(result3).toBe(false);
  });

  it('should return false if the display name is an empty string', () => {
    const result = isValidDisplayName('');
    expect(result).toBe(false);
  });

  it('should return false if the display name is longer than 25 characters', () => {
    const result = isValidDisplayName('a'.repeat(26));
    expect(result).toBe(false);
  });

  it('should return false if anything but latin English letters and valid whitespace are used', () => {
    const result1 = isValidDisplayName('John Do3');
    const result2 = isValidDisplayName('John Doe #@$@');
    const result3 = isValidDisplayName(' John Doe _.');

    expect(result1).toBe(false);
    expect(result2).toBe(false);
    expect(result3).toBe(false);
  });

  it('should return true if a valid display name is provided', () => {
    const result1 = isValidDisplayName('John Doe');
    const result2 = isValidDisplayName('Jane Doe');
    const result3 = isValidDisplayName('Sara');

    expect(result1).toBe(true);
    expect(result2).toBe(true);
    expect(result3).toBe(true);
  });
});

describe('isValidDateOfBirthTimestamp', () => {
  it('should return false if the value is not an integer', () => {
    const result = isValidDateOfBirthTimestamp(22.5);
    expect(result).toBe(false);
  });

  it('should return false if the timestamp reflects an age lower than 13', () => {
    const result = isValidDateOfBirthTimestamp(Date.now() - dayMilliseconds * 30 * 12 * 10);
    expect(result).toBe(false);
  });

  it('should return false if the timestamp reflects an age larger than 125', () => {
    const result = isValidDateOfBirthTimestamp(Date.now() - dayMilliseconds * 30 * 12 * 150);
    expect(result).toBe(false);
  });

  it('should return true if the timestamp reflects an age between 13 and 125', () => {
    const result = isValidDateOfBirthTimestamp(Date.now() - dayMilliseconds * 30 * 12 * 20);
    expect(result).toBe(true);
  });
});
