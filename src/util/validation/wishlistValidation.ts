import { PRIVATE_WISHLIST_PRIVACY_LEVEL, PUBLIC_WISHLIST_PRIVACY_LEVEL } from '../constants';
import { containsInvalidWhitespace } from '../globalUtils';

export function isValidWishlistPrivacyLevel(value: any): boolean {
  if (typeof value !== 'number') {
    return false;
  }

  if (!Number.isInteger(value)) {
    return false;
  }

  if (value < PRIVATE_WISHLIST_PRIVACY_LEVEL || value > PUBLIC_WISHLIST_PRIVACY_LEVEL) {
    return false;
  }

  return true;
}

export function isValidWishlistTitle(value: any): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  if (containsInvalidWhitespace(value)) {
    return false;
  }

  const regex: RegExp = /^(?=.{1,50}$)(?!.*  )[\x00-\x7F]+(?: [\x00-\x7F]+)*$/;
  return regex.test(value);
}
