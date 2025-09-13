export function validateWishlistItemTitle(value: string): string | null {
  if (value === '') {
    return 'A valid item title is required.';
  }

  if (value !== value.trim()) {
    return 'Title must not contain leading or trailing whitespace.';
  }

  if (/\s{2,}/.test(value)) {
    return 'Title must not contain consecutive whitespaces';
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
  if (value !== value.trim()) {
    return 'Description must not contain leading or trailing whitespace.';
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
  if (!value.startsWith('http://') && !value.startsWith('https://')) {
    return `Link must start with either "http://" or "https://".`;
  }

  if (value.length > 2000) {
    return `Link can't exceed 2000 characters.`;
  }

  const regex = /^(?=.{1,2000}$)(https?:\/\/[^\s/$.?#].[^\s]*)$/i;
  if (!regex.test(value)) {
    return 'Invalid item link.';
  }

  return null;
}
