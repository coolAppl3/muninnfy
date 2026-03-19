import { containsInvalidWhitespace } from '../globalUtils';

export function validateWishlistTitle(value: string): string | null {
  value = value.trimEnd();

  if (value === '') {
    return 'A valid wishlist title is required.';
  }

  if (value !== value.trimStart()) {
    return 'Title must not contain leading whitespace.';
  }

  if (containsInvalidWhitespace(value)) {
    return 'Title must not contain consecutive whitespaces.';
  }

  if (value.length > 50) {
    return 'Title must not exceed 50 characters.';
  }

  const regex: RegExp = /^(?=.{1,50}$)(?!.*  )[\x00-\x7F]+(?: [\x00-\x7F]+)*$/;
  if (!regex.test(value)) {
    return 'Only standard letters, numbers, and symbols are allowed.';
  }

  return null;
}
