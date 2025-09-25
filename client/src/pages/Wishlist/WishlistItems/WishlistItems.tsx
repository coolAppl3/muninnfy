import { JSX } from 'react';
import useWishlist from '../context/useWishlist';
import Container from '../../../components/Container/Container';
import WishlistItem from './WishlistItem/WishlistItem';
import { WishlistItemType } from '../../../types/wishlistItemTypes';

export default function WishlistItems(): JSX.Element {
  const { wishlistItems } = useWishlist();

  return (
    <section className='wishlist-items'>
      <Container>
        <div className='wishlist-items-container'>
          {wishlistItems.length === 0 ? (
            <p className='no-items'>No items found</p>
          ) : (
            wishlistItems.map((item: WishlistItemType) => (
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
