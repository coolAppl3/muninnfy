import { WISHLIST_ITEM_TAGS_LIMIT } from '../constants/wishlistItemConstants';

export function isValidWishlistItemTagName(value: any): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  const regex: RegExp = /^[A-Za-z0-9_]{1,50}$/;
  return regex.test(value);
}

export function sanitizedWishlistItemTags(tags: any[], itemId: number): [number, string][] {
  const sanitizedTags: [number, string][] = [];
  const tagsSet = new Set<string>();

  for (const tag of tags.slice(0, WISHLIST_ITEM_TAGS_LIMIT)) {
    if (typeof tag !== 'string') {
      continue;
    }

    if (!isValidWishlistItemTagName(tag)) {
      continue;
    }

    tagsSet.add(tag);
  }

  for (const tag of tagsSet) {
    sanitizedTags.push([itemId, tag]);
  }

  return sanitizedTags;
}
