export type WishlistItemType = {
  item_id: number;
  added_on_timestamp: number;
  title: string;
  description: string | null;
  link: string | null;
  price: string | null;
  purchased_on_timestamp: number | null;
  tags: {
    id: number;
    name: string;
  }[];
};
