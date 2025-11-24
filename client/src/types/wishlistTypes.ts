export type WishlistDetailsType = {
  privacy_level: number;
  title: string;
  created_on_timestamp: number;
  is_favorited: boolean;
};

export type ExtendedWishlistDetailsType = {
  wishlist_id: string;
  privacy_level: number;
  title: string;
  created_on_timestamp: number;
  is_favorited: boolean;
  items_count: number;
  purchased_items_count: number;
  total_items_price: number;
  price_to_complete: number;
};
