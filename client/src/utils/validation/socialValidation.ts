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
