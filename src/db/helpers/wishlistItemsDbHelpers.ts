import { Request } from 'express';
import { Pool, PoolConnection, RowDataPacket } from 'mysql2/promise';
import { logUnexpectedError } from '../../logs/errorLogger';

interface MappedWishlistItem {
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
}

export async function getWishlistItemByTitle(
  itemTitle: string,
  wishlistId: string,
  executor: Pool | PoolConnection,
  req: Request
): Promise<MappedWishlistItem | null> {
  interface WishlistItemDetails {
    item_id: number;
    added_on_timestamp: number;
    title: string;
    description: string | null;
    link: string | null;
    is_purchased: boolean;
    tag_id: number;
    tag_name: string;
  }

  try {
    const [wishlistItemRows] = await executor.execute<RowDataPacket[]>(
      `SELECT
        wishlist_items.item_id,
        wishlist_items.added_on_timestamp,
        wishlist_items.title,
        wishlist_items.description,
        wishlist_items.link,
        wishlist_items.is_purchased,
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

    const wishlistItemDetails = wishlistItemRows[0] as WishlistItemDetails | undefined;

    if (!wishlistItemDetails) {
      return null;
    }

    const { tag_id: _, tag_name: __, ...rest } = wishlistItemDetails;
    const mappedWishlistItem: MappedWishlistItem = {
      ...rest,
      tags: wishlistItemRows.map(({ tag_id, tag_name }) => ({
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
