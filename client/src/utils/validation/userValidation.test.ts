import { describe, expect, it } from 'vitest';
import {
  validateDateOfBirthTimestamp,
  validateDisplayName,
  validateEmail,
  validateNewPassword,
  validatePassword,
  validateUsername,
} from './userValidation';

describe('validateEmail', () => {
  it('should return an error message if the value provided is an empty string', () => {
    expect(validateEmail('')).toBe('A valid email is required.');
  });

  it('should return an error message if the value provided contains whitespace', () => {
    expect(validateEmail('some invalid email@example.com')).toBe(
      'Email must not contain any whitespace.'
    );
    expect(validateEmail('some\ninvalid\nemail@example.com')).toBe(
      'Email must not contain any whitespace.'
    );
  });

  it('should return an error message if the value provided is an invalid email', () => {
    expect(validateEmail('e.com')).toBe('Invalid email format.');
    expect(validateEmail('e.')).toBe('Invalid email format.');
    expect(validateEmail('e@example')).toBe('Invalid email format.');
    expect(validateEmail('@example.com')).toBe('Invalid email format.');
    expect(validateEmail('invalid@@example.com.com')).toBe('Invalid email format.');
  });

  it('should return null if the value provided is a valid email (minimal validation, leaving full validation for the verification process)', () => {
    expect(validateEmail('a@b.cd')).toBeNull();
    expect(validateEmail('example@example.com')).toBeNull();
    expect(validateEmail('example@example.co.uk')).toBeNull();
  });
});

describe('validateNewPassword', () => {
  it('should return an error message if the value provided is an empty string', () => {
    expect(validateNewPassword('')).toBe('A valid password is required.');
  });

  it('should return an error message if the value provided contains whitespace', () => {
    expect(validateNewPassword('some password')).toBe(
      'Password must not contain any whitespace.'
    );
    expect(validateNewPassword('some  password')).toBe(
      'Password must not contain any whitespace.'
    );
    expect(validateNewPassword(' somePassword')).toBe(
      'Password must not contain any whitespace.'
    );
    expect(validateNewPassword(' somePassword ')).toBe(
      'Password must not contain any whitespace.'
    );
    expect(validateNewPassword('somePassword ')).toBe(
      'Password must not contain any whitespace.'
    );
    expect(validateNewPassword('some\npassword')).toBe(
      'Password must not contain any whitespace.'
    );
    expect(validateNewPassword('some\n\npassword')).toBe(
      'Password must not contain any whitespace.'
    );
  });

  it('should return an error message if the value provided is below 8 characters in length', () => {
    expect(validateNewPassword('pass111')).toBe('Password must at least contain 8 characters.');
    expect(validateNewPassword('123')).toBe('Password must at least contain 8 characters.');
  });

  it('should return an error message if the value provided is more than 40 characters long', () => {
    expect(validateNewPassword('a'.repeat(41))).toBe('Password must not exceed 40 characters.');
  });

  it('should return an error message if the value provided contains anything but English letters, numbers, or the following symbols: _.!#$&', () => {
    expect(validateNewPassword('invalid=password')).toBe(
      'Only English letters, numbers, and the following symbols are allowed: `_`, `.`, `!`, `#`, `$`, `&`.'
    );
    expect(validateNewPassword('{}invalidPassword')).toBe(
      'Only English letters, numbers, and the following symbols are allowed: `_`, `.`, `!`, `#`, `$`, `&`.'
    );
    expect(validateNewPassword('invalid/\\/=--')).toBe(
      'Only English letters, numbers, and the following symbols are allowed: `_`, `.`, `!`, `#`, `$`, `&`.'
    );
  });

  it('should return null if the value provided is a valid password', () => {
    expect(validateNewPassword('someValidPassword')).toBeNull();
    expect(validateNewPassword('alsoValid_.!#$&')).toBeNull();
  });
});

describe('validatePassword', () => {
  it('should return an error message if the value provided is an empty string', () => {
    expect(validatePassword('')).toBe('Password required.');
  });

  it('should return an error message if value provided contains whitespace', () => {
    expect(validatePassword('some password')).toBe('Password must not contain any whitespace.');
    expect(validatePassword('some  password')).toBe(
      'Password must not contain any whitespace.'
    );
    expect(validatePassword(' somePassword')).toBe('Password must not contain any whitespace.');
    expect(validatePassword(' somePassword ')).toBe(
      'Password must not contain any whitespace.'
    );
    expect(validatePassword('somePassword ')).toBe('Password must not contain any whitespace.');
    expect(validatePassword('some\npassword')).toBe(
      'Password must not contain any whitespace.'
    );
    expect(validatePassword('some\n\npassword')).toBe(
      'Password must not contain any whitespace.'
    );
  });

  it('should return an error message if the value provided is more than 40 characters long', () => {
    expect(validatePassword('a'.repeat(41))).toBe('Password must not exceed 40 characters.');
  });

  it('should return null if a the value provided is a valid password (less strict than validateNewPassword)', () => {
    expect(validatePassword('pass')).toBeNull();
    expect(validatePassword('somePassword')).toBeNull();
    expect(validatePassword('some_password_123')).toBeNull();
  });
});

describe('validateUsername', () => {
  it('should return an error message if the value provided is an empty string', () => {
    expect(validateUsername('')).toBe('A valid username is required.');
  });

  it('should return an error message if the value provided contains whitespace', () => {
    expect(validateUsername('someUsername ')).toBe('Username must not contain any whitespace.');
    expect(validateUsername(' someUsername')).toBe('Username must not contain any whitespace.');
    expect(validateUsername(' someUsername ')).toBe(
      'Username must not contain any whitespace.'
    );
    expect(validateUsername('\nsome Username\n')).toBe(
      'Username must not contain any whitespace.'
    );
    expect(validateUsername('some\nUsername')).toBe(
      'Username must not contain any whitespace.'
    );
  });

  it('should return an error message if the value provided is shorter than 5 characters', () => {
    expect(validateUsername('a')).toBe('Username must at least contain 5 characters.');
    expect(validateUsername('aa')).toBe('Username must at least contain 5 characters.');
    expect(validateUsername('aaa')).toBe('Username must at least contain 5 characters.');
    expect(validateUsername('aaaa')).toBe('Username must at least contain 5 characters.');
  });

  it('should return an error message if the value provided is longer than 25 characters', () => {
    expect(validateUsername('a'.repeat(26))).toBe('Username must not exceed 25 characters.');
  });

  it('should return an error message if the value provided uses characters other than English letters, numbers, underscores, and periods', () => {
    expect(validateUsername('some-username')).toBe(
      'Only English letters, numbers, and the following symbols are allowed: `_`, `.`.'
    );
    expect(validateUsername('some=username')).toBe(
      'Only English letters, numbers, and the following symbols are allowed: `_`, `.`.'
    );
    expect(validateUsername('some!username')).toBe(
      'Only English letters, numbers, and the following symbols are allowed: `_`, `.`.'
    );
    expect(validateUsername('some$username')).toBe(
      'Only English letters, numbers, and the following symbols are allowed: `_`, `.`.'
    );
    expect(validateUsername('some@username')).toBe(
      'Only English letters, numbers, and the following symbols are allowed: `_`, `.`.'
    );
    expect(validateUsername('some%username')).toBe(
      'Only English letters, numbers, and the following symbols are allowed: `_`, `.`.'
    );
  });

  it('should return null if the value provided is a valid username', () => {
    expect(validateUsername('user2')).toBeNull();
    expect(validateUsername('user23')).toBeNull();
    expect(validateUsername('someUsername')).toBeNull();
    expect(validateUsername('longButValidUsername12345')).toBeNull();
    expect(validateUsername('some_username.123')).toBeNull();
  });
});

describe('validateDisplayName', () => {
  it('should return an error message if the value provided is an empty string', () => {
    expect(validateDisplayName('')).toBe('A valid display name is required.');
  });

  it('should return an error message if the value provided is trailed or led by whitespace', () => {
    expect(validateDisplayName('John ')).toBe(
      'Display name must not contain leading or trailing whitespace.'
    );
    expect(validateDisplayName(' John ')).toBe(
      'Display name must not contain leading or trailing whitespace.'
    );
    expect(validateDisplayName(' John')).toBe(
      'Display name must not contain leading or trailing whitespace.'
    );
    expect(validateDisplayName('John\n')).toBe(
      'Display name must not contain leading or trailing whitespace.'
    );
    expect(validateDisplayName('\nJohn')).toBe(
      'Display name must not contain leading or trailing whitespace.'
    );
    expect(validateDisplayName('\nJohn\n')).toBe(
      'Display name must not contain leading or trailing whitespace.'
    );
    expect(validateDisplayName('John Doe ')).toBe(
      'Display name must not contain leading or trailing whitespace.'
    );
  });

  it('should return an error message if the value provided contains consecutive whitespaces within', () => {
    expect(validateDisplayName('John  Doe')).toBe(
      'Display name must not contain consecutive whitespaces.'
    );
    expect(validateDisplayName('John \nDoe')).toBe(
      'Display name must not contain consecutive whitespaces.'
    );
    expect(validateDisplayName('John\n\nDoe')).toBe(
      'Display name must not contain consecutive whitespaces.'
    );
    expect(validateDisplayName('John Doe  II')).toBe(
      'Display name must not contain consecutive whitespaces.'
    );
  });

  it('should return an error message if the value provided is longer than 25 characters', () => {
    expect(validateDisplayName('a'.repeat(26))).toBe(
      'Display name must not exceed 25 characters.'
    );
  });

  it('should return an error message if the value provided contains anything but English letters and non-consecutive whitespaces', () => {
    expect(validateDisplayName('John 123')).toBe(
      'Only English letters and non-consecutive whitespaces are allowed.'
    );
    expect(validateDisplayName('John !@#$%^&')).toBe(
      'Only English letters and non-consecutive whitespaces are allowed.'
    );
  });

  it('should return null if the value provided is a valid display name', () => {
    expect(validateDisplayName('John Doe')).toBeNull();
    expect(validateDisplayName('Valid but long full names')).toBeNull();
  });
});

describe('validateDateOfBirthTimestamp', () => {
  it('should return an error message if the timestamp provided is not an integer ', () => {
    expect(validateDateOfBirthTimestamp(undefined)).toBe('A valid date of birth is required.');
    expect(validateDateOfBirthTimestamp(123.123)).toBe('A valid date of birth is required.');
  });

  it('should return an error message if the timestamp provided represents an age younger than 13', () => {
    const dateObj: Date = new Date();
    const youngestTimestamp: number = new Date(
      dateObj.getFullYear() - 13,
      dateObj.getMonth(),
      dateObj.getDate()
    ).getTime();

    expect(validateDateOfBirthTimestamp(youngestTimestamp + 1000)).toBe(
      'You must be 13 years or older to sign up.'
    );
    expect(validateDateOfBirthTimestamp(Date.now())).toBe(
      'You must be 13 years or older to sign up.'
    );
  });

  it('should return an error message if the timestamp provided represents an age over 125 years', () => {
    const yearMilliseconds: number = 365.25 * 24 * 60 * 60 * 1000;

    expect(validateDateOfBirthTimestamp(new Date().getTime() - yearMilliseconds * 125)).toBe(
      'A valid date of birth is required.'
    );
    expect(validateDateOfBirthTimestamp(new Date().getTime() - yearMilliseconds * 126)).toBe(
      'A valid date of birth is required.'
    );
  });
});
