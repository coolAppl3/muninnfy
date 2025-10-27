import { WISHLIST_ITEM_MAX_PRICE } from '../constants/wishlistItemConstants';
import { containsInvalidWhitespace } from '../globalUtils';

export function isValidWishlistItemTitle(value: any): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  if (containsInvalidWhitespace(value)) {
    return false;
  }

  const regex: RegExp = /^(?=.{1,50}$)(?!.*  )[\x00-\x7F]+(?: [\x00-\x7F]+)*$/;
  return regex.test(value);
}

export function isValidWishlistItemDescription(value: any): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  const regex: RegExp = /^[\x00-\x7F]{1,500}$/;
  return regex.test(value);
}

export function isValidWishlistItemLink(value: any): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  const regex: RegExp = /^(https?:\/\/)?[^\s]{1,2000}$/i;
  return regex.test(value);
}

export function isValidWishlistItemPrice(value: any): boolean {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return false;
  }

  if (value < 0 || value > WISHLIST_ITEM_MAX_PRICE) {
    return false;
  }

  const decimalPortion: string | undefined = value.toString().split('.')[1];
  if (!decimalPortion || decimalPortion.length > 2) {
    return false;
  }

  return true;
}
