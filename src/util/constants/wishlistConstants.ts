import { dayMilliseconds, minuteMilliseconds } from './globalConstants';

export const PRIVATE_WISHLIST_PRIVACY_LEVEL: number = 0;
export const FOLLOWERS_WISHLIST_PRIVACY_LEVEL: number = 1;
export const PUBLIC_WISHLIST_PRIVACY_LEVEL: number = 2;

export const TOTAL_WISHLISTS_LIMIT: number = 100;
export const WISHLIST_ITEMS_LIMIT: number = 100;

export const WISHLIST_INTERACTION_MAX_VALUE: number = 200;
export const WISHLIST_INTERACTION_CREATE: number = 10;
export const WISHLIST_INTERACTION_ADD_ITEM: number = 6;
export const WISHLIST_INTERACTION_GENERAL: number = 2;
export const WISHLIST_INTERACTION_BULK_SMALL: number = 4;
export const WISHLIST_INTERACTION_BULK_LARGE: number = 6;
export const WISHLIST_INTERACTION_BULK_BORDER: number = 20; // beyond this value counts as a large bulk interaction
export const WISHLIST_INTERACTION_THROTTLE_WINDOW: number = minuteMilliseconds * 10;

export const WISHLIST_INTERACTIVITY_DECAY_AMOUNT: number = 2;
export const WISHLIST_INTERACTIVITY_DECAY_GRACE_PERIOD: number = dayMilliseconds;
