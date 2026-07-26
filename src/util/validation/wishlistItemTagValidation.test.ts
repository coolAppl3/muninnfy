import { describe, expect, it } from 'vitest';
import {
  isValidWishlistItemTagName,
  sanitizeWishlistItemTags,
} from './wishlistItemTagValidation';

describe('isValidWishlistItemTagName', () => {
  it('should return false if the value is not a string', () => {
    const result1 = isValidWishlistItemTagName(23);
    const result2 = isValidWishlistItemTagName({});
    const result3 = isValidWishlistItemTagName([]);

    expect(result1).toBe(false);
    expect(result2).toBe(false);
    expect(result3).toBe(false);
  });

  it('should return false if the value contains any whitespace', () => {
    const result1 = isValidWishlistItemTagName(' someTag');
    const result2 = isValidWishlistItemTagName('someTag ');
    const result3 = isValidWishlistItemTagName(' someTag ');

    expect(result1).toBe(false);
    expect(result2).toBe(false);
    expect(result3).toBe(false);
  });

  it('should return false if the tag is longer than 50 characters', () => {
    const result = isValidWishlistItemTagName('a'.repeat(51));
    expect(result).toBe(false);
  });

  it('should return true if a valid tag is provided', () => {
    const result1 = isValidWishlistItemTagName('someTag');
    const result2 = isValidWishlistItemTagName('someTag123');
    const result3 = isValidWishlistItemTagName('a'.repeat(50));

    expect(result1).toBe(true);
    expect(result2).toBe(true);
    expect(result3).toBe(true);
  });
});

describe('sanitizeWishlistItemTags', () => {
  it('should accept an array of tags and an item ID, returning n array of itemId-tagName arrays, removing any invalid tag names', () => {
    const result = sanitizeWishlistItemTags(['tag1', 'tag2', 23, 'tag4'], 1);
    expect(result).toStrictEqual([
      [1, 'tag1'],
      [1, 'tag2'],
      [1, 'tag4'],
    ]);
  });
});
