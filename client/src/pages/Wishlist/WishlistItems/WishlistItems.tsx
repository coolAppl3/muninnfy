import { JSX } from 'react';
import useWishlist from '../useWishlist';
import Container from '../../../components/Container/Container';
import { WishlistItemInterface } from '../../../services/wishlistServices';
import WishlistItem from './WishlistItem/WishlistItem';

export default function WishlistItems(): JSX.Element {
  const { wishlistItems, setWishlistItems } = useWishlist();

  return (
    <section className='wishlist-items'>
      <Container>
        <div className='wishlist-items-container'>
          {wishlistItems.map((item: WishlistItemInterface) => (
            <WishlistItem
              item={item}
              key={item.item_id}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
