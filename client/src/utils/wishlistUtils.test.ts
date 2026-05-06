import { describe, expect, it } from 'vitest';
import { getFormattedPrice, getWishlistPrivacyLevelName } from './wishlistUtils';
import {
  FOLLOWERS_WISHLIST_PRIVACY_LEVEL,
  PRIVATE_WISHLIST_PRIVACY_LEVEL,
  PUBLIC_WISHLIST_PRIVACY_LEVEL,
} from './constants/wishlistConstants';

describe('getWishlistPrivacyLevelName', () => {
  it('should return Public if the public wishlist privacy level is provided', () => {
    expect(getWishlistPrivacyLevelName(PUBLIC_WISHLIST_PRIVACY_LEVEL)).toBe('Public');
  });

  it('should return Followers if the followers wishlist privacy level is provided', () => {
    expect(getWishlistPrivacyLevelName(FOLLOWERS_WISHLIST_PRIVACY_LEVEL)).toBe('Followers');
  });

  it('should return Private if the private wishlist privacy level is provided', () => {
    expect(getWishlistPrivacyLevelName(PRIVATE_WISHLIST_PRIVACY_LEVEL)).toBe('Private');
  });
});

describe('getFormattedPrice', () => {
  it('should correctly format the provided price, adding two decimal points if it is below 1000, or using umber abbreviations (e.g. K, M) when it is 1000 or above', () => {
    expect(getFormattedPrice(1)).toBe('1.00');
    expect(getFormattedPrice(20)).toBe('20.00');
    expect(getFormattedPrice(219)).toBe('219.00');
    expect(getFormattedPrice(3200)).toBe('3.2K');
    expect(getFormattedPrice(4500000.98)).toBe('4.5M');
  });
});
