import { JSX, useMemo } from 'react';
import useWishlist from '../context/useWishlist';
import Container from '../../../components/Container/Container';
import WishlistItem from './WishlistItem/WishlistItem';
import { WishlistItemType } from '../../../types/wishlistItemTypes';

export default function WishlistItems(): JSX.Element {
  const { wishlistItems, itemMatchesFilterConfig, wishlistItemsLoading, wishlistViewConfig } = useWishlist();

  const filteredItems: WishlistItemType[] = useMemo(
    () => wishlistItems.filter((item: WishlistItemType) => itemMatchesFilterConfig(item)),
    [wishlistItems, itemMatchesFilterConfig]
  );

  return (
    <section>
      <Container>
        <div className={`grid grid-cols-1 ${wishlistViewConfig.isSingleColumnGrid ? '' : 'sm:grid-cols-2'} gap-1 items-start`}>
          {wishlistItemsLoading ? (
            <div className='spinner col-span-2 w-3 h-3 mx-auto'></div>
          ) : filteredItems.length === 0 ? (
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
