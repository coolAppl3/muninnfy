export type WishlistItemType = {
  item_id: number;
  added_on_timestamp: number;
  title: string;
  description: string | null;
  link: string | null;
  is_purchased: boolean;
  tags: {
    id: number;
    name: string;
  }[];
};
