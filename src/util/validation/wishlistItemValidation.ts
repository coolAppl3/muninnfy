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
