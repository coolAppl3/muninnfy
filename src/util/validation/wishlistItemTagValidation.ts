export function isValidWishlistItemTagName(value: any): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  const regex: RegExp = /^[A-Za-z0-9_]{1,50}$/;
  return regex.test(value);
}
