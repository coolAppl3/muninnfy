import { JSX } from 'react';
import useWishlist from '../context/useWishlist';
import Container from '../../../components/Container/Container';
import WishlistItem from './WishlistItem/WishlistItem';
import { WishlistItemType } from '../../../types/wishlistItemTypes';

export default function WishlistItems(): JSX.Element {
  const { wishlistItems, itemMatchesFilterConfig } = useWishlist();
  const filteredItems: WishlistItemType[] = wishlistItems.filter((item: WishlistItemType) => itemMatchesFilterConfig(item));

  return (
    <section className='wishlist-items'>
      <Container>
        <div className='wishlist-items-container grid grid-cols-1 sm:grid-cols-2 gap-1 items-start'>
          {filteredItems.length === 0 ? (
            <p className='sm:!col-span-2 text-sm font-medium text-description w-fit mx-auto'>No items found</p>
          ) : (
            filteredItems.map((item: WishlistItemType) => (
              <WishlistItem
                wishlistItem={item}
                key={item.item_id}
              />
            ))
          )}
        </div>
      </Container>
    </section>
  );
}
