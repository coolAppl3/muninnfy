import { WISHLIST_ITEM_MAX_PRICE } from './wishlistItemConstants';

export const PRIVATE_WISHLIST_PRIVACY_LEVEL: number = 0;
export const FOLLOWERS_WISHLIST_PRIVACY_LEVEL: number = 1;
export const PUBLIC_WISHLIST_PRIVACY_LEVEL: number = 2;

export const WISHLIST_ITEMS_LIMIT: number = 100;
export const WISHLIST_MAX_TOTAL_ITEMS_PRICE: number = WISHLIST_ITEM_MAX_PRICE * WISHLIST_ITEMS_LIMIT;
