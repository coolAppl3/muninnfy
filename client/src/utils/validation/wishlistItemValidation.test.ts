import { describe, expect, it } from 'vitest';
import {
  validateWishlistItemDescription,
  validateWishlistItemLink,
  validateWishlistItemTitle,
} from './wishlistItemValidation';

describe('validateWishlistItemTitle', () => {
  // calls .trimEnd() before evaluating

  it('should return an error message if the value provided, once the end is trimmed, evaluates into an empty string', async () => {
    expect(validateWishlistItemTitle('')).toBe('A valid item title is required.');
    expect(validateWishlistItemTitle(' ')).toBe('A valid item title is required.');
    expect(validateWishlistItemTitle('  ')).toBe('A valid item title is required.');
    expect(validateWishlistItemTitle('\n')).toBe('A valid item title is required.');
    expect(validateWishlistItemTitle('\n\n')).toBe('A valid item title is required.');
  });

  it('should return an error message if the value provided contains leading whitespace', () => {
    expect(validateWishlistItemTitle(' some title')).toBe(
      'Title must not contain leading whitespace.'
    );
    expect(validateWishlistItemTitle('\nsome title')).toBe(
      'Title must not contain leading whitespace.'
    );
  });

  it('should return an error message if value provided contains consecutive whitespaces', () => {
    expect(validateWishlistItemTitle('Some  Title')).toBe(
      'Title must not contain consecutive whitespaces.'
    );
    expect(validateWishlistItemTitle('Some \nTitle')).toBe(
      'Title must not contain consecutive whitespaces.'
    );
    expect(validateWishlistItemTitle('Some\n\nTitle')).toBe(
      'Title must not contain consecutive whitespaces.'
    );
  });

  it('should return an error message if the value provided is longer than 50 characters', () => {
    expect(validateWishlistItemTitle('a'.repeat(51))).toBe(
      'Title must not exceed 50 characters.'
    );
  });

  it('should return an error message if the value provided contains anything but standard ASCII characters', () => {
    expect(validateWishlistItemTitle('Петар Петровић')).toBe(
      'Only standard English letters, numbers, and symbols are allowed.'
    );
    expect(validateWishlistItemTitle('Petar Petrović')).toBe(
      'Only standard English letters, numbers, and symbols are allowed.'
    );
  });

  it('should return null if the value provided is a valid wishlist item title', () => {
    expect(validateWishlistItemTitle('Monitor')).toBeNull();
    expect(validateWishlistItemTitle('Monitor Arm')).toBeNull();
    expect(validateWishlistItemTitle('Monitor Arm 123')).toBeNull();
    expect(validateWishlistItemTitle('Monitor Arm !@#$%^&*()')).toBeNull();
  });
});

describe('validateWishlistItemDescription', () => {
  // calls .trimEnd() before evaluating

  it('should return null if the value provided, after the end is trimmed, is an empty string', () => {
    expect(validateWishlistItemDescription('')).toBeNull();
    expect(validateWishlistItemDescription(' ')).toBeNull();
    expect(validateWishlistItemDescription('  ')).toBeNull();
    expect(validateWishlistItemDescription('\n')).toBeNull();
    expect(validateWishlistItemDescription('\n\n')).toBeNull();
  });

  it('should return an error message if the value provided contains leading whitespace', () => {
    expect(validateWishlistItemDescription(' some description')).toBe(
      'Description must not contain leading whitespace.'
    );
    expect(validateWishlistItemDescription('\nsome description')).toBe(
      'Description must not contain leading whitespace.'
    );
  });

  it('should return an error message if the value provided contains more than 500 characters', () => {
    expect(validateWishlistItemDescription('a'.repeat(501))).toBe(
      'Description must not exceed 500 characters.'
    );
  });

  it('should return an error message if the value provided contains anything but standard ASCII characters', () => {
    expect(validateWishlistItemDescription('Петар Петровић')).toBe(
      'Only standard English letters, numbers, and symbols are allowed.'
    );
    expect(validateWishlistItemDescription('Petar Petrović')).toBe(
      'Only standard English letters, numbers, and symbols are allowed.'
    );
  });
});

describe('validateWishlistItemLink', () => {
  // calls .trimEnd() before evaluating

  it('should return null if the value provided, after the end is trimmed, is an empty string', () => {
    expect(validateWishlistItemLink('')).toBeNull();
    expect(validateWishlistItemLink(' ')).toBeNull();
    expect(validateWishlistItemLink('  ')).toBeNull();
    expect(validateWishlistItemLink('\n')).toBeNull();
    expect(validateWishlistItemLink('\n\n')).toBeNull();
  });

  it('should return an error message if the value provided is longer than 2000 characters', () => {
    expect(validateWishlistItemLink('a'.repeat(2001))).toBe(
      `Link can't exceed 2000 characters.`
    );
  });

  it('should return an error message if the value provided does not start with https://', () => {
    expect(validateWishlistItemLink('someLink.com'));
    expect(validateWishlistItemLink('someLink'));
  });

  it('should return an error message if the value provided is an invalid link (', () => {
    expect(validateWishlistItemLink('someLink-com'));
    expect(validateWishlistItemLink('someLink'));
    expect(validateWishlistItemLink(' someLink'));
  });
});
