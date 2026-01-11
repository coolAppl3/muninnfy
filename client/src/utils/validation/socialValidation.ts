import { containsInvalidWhitespace } from '../globalUtils';

export function validateSearchQuery(value: string): string | null {
  if (containsInvalidWhitespace(value)) {
    return 'Search query must not contain consecutive whitespaces.';
  }

  if (value.length > 25) {
    return 'Search query must not exceed 25 characters.';
  }

  const regex: RegExp = /^(?=.{1,25}$)(?!.*  )[A-Za-z0-9._]+(?: [A-Za-z0-9._]+)*$/;
  if (!regex.test(value)) {
    return 'Only English letters, numbers, and the following symbols are allowed: `_`, `.`.';
  }

  return null;
}
