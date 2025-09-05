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
    return 'Followers only';
  }

  if (privacyLevel === PRIVATE_WISHLIST_PRIVACY_LEVEL) {
    return 'Private';
  }

  return '';
}
