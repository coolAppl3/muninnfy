import { containsInvalidWhitespace } from '../globalUtils';

export function validateWishlistItemTitle(value: string): string | null {
  value = value.trimEnd();

  if (value === '') {
    return 'A valid item title is required.';
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

export function validateWishlistItemDescription(value: string): string | null {
  value = value.trimEnd();

  if (value === '') {
    return null;
  }

  if (value !== value.trimStart()) {
    return 'Description must not contain leading whitespace.';
  }

  if (value.length > 500) {
    return 'Description must not exceed 500 characters.';
  }

  const regex: RegExp = /^[\x00-\x7F]{1,500}$/;
  if (!regex.test(value)) {
    return 'Only standard letters, numbers, and symbols are allowed.';
  }

  return null;
}

export function validateWishlistItemLink(value: string): string | null {
  value = value.trimEnd();

  if (value === '') {
    return null;
  }

  if (value.length > 2000) {
    return `Link can't exceed 2000 characters.`;
  }

  if (!value.startsWith('https://')) {
    return 'Link must start with `https://`.';
  }

  const regex: RegExp = /^https:\/\/[^\s]{1,1992}$/;
  if (!regex.test(value)) {
    return 'Invalid link.';
  }

  return null;
}
