import { PRIVATE_WISHLIST_PRIVACY_LEVEL, PUBLIC_WISHLIST_PRIVACY_LEVEL } from '../constants';
import { containsInvalidWhitespace } from '../globalUtils';

export function isValidWishlistPrivacyLevel(privacyLevel: any): boolean {
  if (typeof privacyLevel !== 'number') {
    return false;
  }

  if (!Number.isInteger(privacyLevel)) {
    return false;
  }

  if (privacyLevel < PRIVATE_WISHLIST_PRIVACY_LEVEL || privacyLevel > PUBLIC_WISHLIST_PRIVACY_LEVEL) {
    return false;
  }

  return true;
}

export function isValidWishlistTitle(title: any): boolean {
  if (typeof title !== 'string') {
    return false;
  }

  if (containsInvalidWhitespace(title)) {
    return false;
  }

  const regex: RegExp = /^(?=.{1,50}$)(?!.*  )[\x00-\x7F]+(?: [\x00-\x7F]+)*$/;
  return regex.test(title);
}
