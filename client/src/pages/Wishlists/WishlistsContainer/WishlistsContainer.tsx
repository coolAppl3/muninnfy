import { JSX, useMemo } from 'react';
import Container from '../../../components/Container/Container';
import useWishlists from '../hooks/useWishlists';
import WishlistCard from '../../../components/WishlistCard/WishlistCard';
import { ExtendedWishlistDetailsType } from '../../../types/wishlistTypes';

export default function WishlistsContainer(): JSX.Element {
  const { wishlists, isSingleColumnView, wishlistsFilterConfig, wishlistMatchesFilterConfig } = useWishlists();

  const filteredWishlists: ExtendedWishlistDetailsType[] = useMemo(
    () => wishlists.filter(wishlistMatchesFilterConfig),
    [wishlists, wishlistMatchesFilterConfig]
  );

  const filtersAppliedCount: number = Object.entries(wishlistsFilterConfig).reduce(
    (acc: number, [key, value]: [string, number | string | boolean | Set<string> | null]) => {
      if (value === null || key === 'titleQuery' || key === 'itemTitleQuery') {
        return acc;
      }

      if (key === 'crossWishlistQueryIdSet' && value === null) {
        return acc;
      }

      return acc + 1;
    },
    0
  );

  return (
    <section>
      <Container>
        {filtersAppliedCount > 0 && (
          <>
            <div className='text-sm font-medium flex justify-between items-center'>
              <p className='text-cta leading-[1] flex gap-1'>
                {filtersAppliedCount === 1 ? '1 filter' : `${filtersAppliedCount} filters`} applied
              </p>

              <p className='text-description leading-[1]'>
                Showing {filteredWishlists.length} of {wishlists.length}
              </p>
            </div>

            <div className='h-line mt-1 mb-2'></div>
          </>
        )}

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
