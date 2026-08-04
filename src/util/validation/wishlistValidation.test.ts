import { describe, expect, it } from 'vitest';
import { isValidWishlistPrivacyLevel, isValidWishlistTitle } from './wishlistValidation';
import {
  FOLLOWERS_WISHLIST_PRIVACY_LEVEL,
  PRIVATE_WISHLIST_PRIVACY_LEVEL,
  PUBLIC_WISHLIST_PRIVACY_LEVEL,
} from '../constants/wishlistConstants';

describe('isValidWishlistPrivacyLevel', () => {
  it('should return false if the value is not an integer', async () => {
    const result = isValidWishlistPrivacyLevel(23.5);
    expect(result).toBe(false);
  });

  it('should return false if the value is less than PRIVATE_WISHLIST_PRIVACY_LEVEL', async () => {
    const result = isValidWishlistPrivacyLevel(PRIVATE_WISHLIST_PRIVACY_LEVEL - 1);
    expect(result).toBe(false);
  });

  it('should return false if the value is less than PUBLIC_WISHLIST_PRIVACY_LEVEL', async () => {
    const result = isValidWishlistPrivacyLevel(PUBLIC_WISHLIST_PRIVACY_LEVEL + 1);
    expect(result).toBe(false);
  });

  it('should return true if the value matches the available privacy levels', () => {
    const result1 = isValidWishlistPrivacyLevel(PRIVATE_WISHLIST_PRIVACY_LEVEL);
    const result2 = isValidWishlistPrivacyLevel(FOLLOWERS_WISHLIST_PRIVACY_LEVEL);
    const result3 = isValidWishlistPrivacyLevel(PUBLIC_WISHLIST_PRIVACY_LEVEL);

    expect(result1).toBe(true);
    expect(result2).toBe(true);
    expect(result3).toBe(true);
  });
});

describe('isValidWishlistTitl', () => {
  it('should return false if the value is not a string', () => {
    const result1 = isValidWishlistTitle(23);
    const result2 = isValidWishlistTitle({});
    const result3 = isValidWishlistTitle([]);

    expect(result1).toBe(false);
    expect(result2).toBe(false);
    expect(result3).toBe(false);
  });

  it('should return false if the title contains invalid white space', () => {
    const result1 = isValidWishlistTitle(' some title');
    const result2 = isValidWishlistTitle(' some title ');
    const result3 = isValidWishlistTitle('some title ');

    expect(result1).toBe(false);
    expect(result2).toBe(false);
    expect(result3).toBe(false);
  });

  it('should return false if the title contains any non-ASCII characters', () => {
    const result = isValidWishlistTitle('улица');
    expect(result).toBe(false);
  });

  it('should return false if the title contains more than 50 characters', () => {
    const result = isValidWishlistTitle('a'.repeat(51));
    expect(result).toBe(false);
  });

  it('should return false if the title is an empty string', () => {
    const result = isValidWishlistTitle('');
    expect(result).toBe(false);
  });

  it('should return true if a valid title is provided', () => {
    const result1 = isValidWishlistTitle('some title');
    const result2 = isValidWishlistTitle('some title 123!');
    const result3 = isValidWishlistTitle('some title !@#$%^');

    expect(result1).toBe(true);
    expect(result2).toBe(true);
    expect(result3).toBe(true);
  });
});
