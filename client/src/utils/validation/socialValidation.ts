import { isValidUuid } from './generalValidation';

export function validateSearchQuery(value: string): string | null {
  if (value.length === 0) {
    return null;
  }

  if (value.trim() === '') {
    return 'Search query must include at least one valid character.';
  }

  if (value.length > 25) {
    return 'Search query must not exceed 25 characters.';
  }

  const regex: RegExp = /^(?=.{1,25}$)(?=.*[A-Za-z0-9._])[A-Za-z0-9._\s]*$/;
  if (!regex.test(value)) {
    return 'Only English letters, numbers, whitespace, and the following symbols are allowed: `_`, `.`.';
  }

  return null;
}

export function validateSocialFindQuery(value: string): string | null {
  if (value.length === 0) {
    return 'A valid search query is required.';
  }

  if (/\s/.test(value)) {
    return 'Search query must not contain any whitespace.';
  }

  if (value.includes('-')) {
    if (isValidUuid(value)) {
      return null;
    }

    return 'Invalid account ID.';
  }

  if (value.length < 3) {
    return 'Search query must at least contain 3 characters.';
  }

  if (value.length > 25) {
    return 'Username-based search query must not exceed 25 characters.';
  }

  const regex: RegExp = /^[A-Za-z0-9._]{3,25}$/;
  if (!regex.test(value)) {
    return 'Only English letters, numbers, whitespace, and the following symbols are allowed: `_`, `.`.';
  }

  return null;
}
