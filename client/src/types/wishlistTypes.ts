export type WishlistDetailsType = {
  privacy_level: number;
  title: string;
  created_on_timestamp: number;
  is_favorited: boolean;
};

export type ViewWishlistDetailsType = Omit<
  WishlistDetailsType,
  'privacy_level' | 'is_favorited'
>;

export type ExtendedWishlistDetailsType = {
  wishlist_id: string;
  privacy_level: number;
  title: string;
  created_on_timestamp: number;
  is_favorited: boolean;
  interactivity_index: number;
  latest_interaction_timestamp: number;
  items_count: number;
  purchased_items_count: number;
  total_items_price: number;
  price_to_complete: number;
};

export type ViewWishlistOwnerDetails = {
  owner_public_account_id: string;
  owner_username: string;
  owner_display_name: string;
};

export type ViewWishlistDetails = {
  wishlist_id: string;
  title: string;
  created_on_timestamp: number;
  items_count: number;
  purchased_items_count: number;
  total_items_price: number;
  price_to_complete: number;
};
