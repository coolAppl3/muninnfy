export function validateWishlistTitle(value: string): string | null {
  if (value === '') {
    return 'A valid wishlist title is required.';
  }

  if (value !== value.trim()) {
    return 'Title must not contain leading or trailing whitespace.';
  }

  if (/\s{2,}/.test(value)) {
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
