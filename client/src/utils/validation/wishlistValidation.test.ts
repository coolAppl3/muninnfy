import { describe, expect, it } from 'vitest';
import { validateWishlistTitle } from './wishlistValidation';

describe('validateWishlistTitle', () => {
  // calls .trimEnd() before evaluating

  it('should return an error message if the value provided, once the end is trimmed, evaluates into an empty string', async () => {
    expect(validateWishlistTitle('')).toBe('A valid wishlist title is required.');
    expect(validateWishlistTitle(' ')).toBe('A valid wishlist title is required.');
    expect(validateWishlistTitle('  ')).toBe('A valid wishlist title is required.');
    expect(validateWishlistTitle('\n')).toBe('A valid wishlist title is required.');
    expect(validateWishlistTitle('\n\n')).toBe('A valid wishlist title is required.');
  });

  it('should return an error message if the value provided contains leading whitespace', () => {
    expect(validateWishlistTitle(' some title')).toBe(
      'Title must not contain leading whitespace.'
    );
    expect(validateWishlistTitle('\nsome title')).toBe(
      'Title must not contain leading whitespace.'
    );
  });

  it('should return an error message if value provided contains consecutive whitespaces', () => {
    expect(validateWishlistTitle('Some  Title')).toBe(
      'Title must not contain consecutive whitespaces.'
    );
    expect(validateWishlistTitle('Some \nTitle')).toBe(
      'Title must not contain consecutive whitespaces.'
    );
    expect(validateWishlistTitle('Some\n\nTitle')).toBe(
      'Title must not contain consecutive whitespaces.'
    );
  });

  it('should return an error message if the value provided is longer than 50 characters', () => {
    expect(validateWishlistTitle('a'.repeat(51))).toBe('Title must not exceed 50 characters.');
  });

  it('should return an error message if the value provided contains anything but standard ASCII characters', () => {
    expect(validateWishlistTitle('Петар Петровић')).toBe(
      'Only standard English letters, numbers, and symbols are allowed.'
    );
    expect(validateWishlistTitle('Petar Petrović')).toBe(
      'Only standard English letters, numbers, and symbols are allowed.'
    );
  });

  it('should return null if the value provided is a valid wishlist title', () => {
    expect(validateWishlistTitle('Monitor')).toBeNull();
    expect(validateWishlistTitle('Monitor Arm')).toBeNull();
    expect(validateWishlistTitle('Monitor Arm 123')).toBeNull();
    expect(validateWishlistTitle('Monitor Arm !@#$%^&*()')).toBeNull();
  });
});
