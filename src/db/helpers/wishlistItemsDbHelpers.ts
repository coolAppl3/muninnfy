import { Request } from 'express';
import { Pool, PoolConnection, RowDataPacket } from 'mysql2/promise';
import { logUnexpectedError } from '../../logs/errorLogger';
import { MappedWishlistItem } from '../../routers/wishlistItemsRouter';

export type WishlistItem = {
  item_id: number;
  added_on_timestamp: number;
  title: string;
  description: string | null;
  link: string | null;
  price: number | null;
  purchased_on_timestamp: number | null;
  tag_id: number;
  tag_name: string;
};

export async function getWishlistItemByTitle(
  itemTitle: string,
  wishlistId: string,
  executor: Pool | PoolConnection,
  req: Request
): Promise<MappedWishlistItem | null> {
  try {
    const [wishlistItemRows] = await executor.execute<RowDataPacket[]>(
      `SELECT
        wishlist_items.item_id,
        wishlist_items.added_on_timestamp,
        wishlist_items.title,
        wishlist_items.description,
        wishlist_items.link,
        wishlist_items.price,
        wishlist_items.purchased_on_timestamp,
        wishlist_item_tags.tag_id,
        wishlist_item_tags.tag_name
      FROM
        wishlist_items
      LEFT JOIN
        wishlist_item_tags USING(item_id)
      WHERE
        wishlist_items.title = ? AND
        wishlist_items.wishlist_id = ?;`,
      [itemTitle, wishlistId]
    );

    const wishlistItemDetails = wishlistItemRows[0] as WishlistItem | undefined;

    if (!wishlistItemDetails) {
      return null;
    }

    const { tag_id: _, tag_name: __, ...rest } = wishlistItemDetails;
    const mappedWishlistItem: MappedWishlistItem = {
      ...rest,
      tags: (wishlistItemRows as WishlistItem[]).map(({ tag_id, tag_name }: WishlistItem) => ({
        id: tag_id,
        name: tag_name,
      })),
    };

    return mappedWishlistItem;
  } catch (err: unknown) {
    console.log(err);
    await logUnexpectedError(req, err, 'failed to fetch wishlist item data');

    return null;
  }
}
