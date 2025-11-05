import {
  FOLLOWERS_WISHLIST_PRIVACY_LEVEL,
  PRIVATE_WISHLIST_PRIVACY_LEVEL,
  PUBLIC_WISHLIST_PRIVACY_LEVEL,
} from './constants/wishlistConstants';

export function getWishlistPrivacyLevelName(privacyLevel: number): string {
  if (privacyLevel === PUBLIC_WISHLIST_PRIVACY_LEVEL) {
    return 'Public';
  }

  if (privacyLevel === FOLLOWERS_WISHLIST_PRIVACY_LEVEL) {
    return 'Followers';
  }

  if (privacyLevel === PRIVATE_WISHLIST_PRIVACY_LEVEL) {
    return 'Private';
  }

  return '';
}

const priceFormatter = new Intl.NumberFormat('en', {
  notation: 'compact',
  compactDisplay: 'short',
  maximumFractionDigits: 1,
});

export function getFormattedPrice(price: number): string {
  if (price < 1000) {
    return price.toFixed(2);
  }

  return priceFormatter.format(price);
}
