import { JSX, useMemo } from 'react';
import Container from '../../../components/Container/Container';
import useWishlists from '../hooks/useWishlists';
import WishlistCard from '../../../components/WishlistCard/WishlistCard';
import { ExtendedWishlistDetailsType } from '../../../types/wishlistTypes';

export default function WishlistsContainer(): JSX.Element {
  const { wishlists, wishlistMatchesFilterConfig, isSingleColumnView } = useWishlists();

  const filteredWishlists: ExtendedWishlistDetailsType[] = useMemo(
    () => wishlists.filter(wishlistMatchesFilterConfig),
    [wishlists, wishlistMatchesFilterConfig]
  );

  return (
    <section>
      <Container>
        <div className={`grid grid-cols-1 ${isSingleColumnView ? '' : 'sm:grid-cols-2'} gap-1 items-start`}>
          {filteredWishlists.length === 0 ? (
            <p className='sm:!col-span-2 text-sm font-medium text-description w-fit mx-auto'>No wishlists found</p>
          ) : (
            filteredWishlists.map((wishlist: ExtendedWishlistDetailsType) => (
              <WishlistCard
                key={wishlist.wishlist_id}
                wishlist={wishlist}
              />
            ))
          )}
        </div>
      </Container>
    </section>
  );
}
