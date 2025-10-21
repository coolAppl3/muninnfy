import { JSX, Profiler, ReactNode, useMemo } from 'react';
import Container from '../../../components/Container/Container';
import WishlistItem from './WishlistItem/WishlistItem';
import { WishlistItemType } from '../../../types/wishlistItemTypes';
import useWishlistItems from '../hooks/useWishlistItems';

export default function WishlistItems(): JSX.Element {
  const { wishlistItems, itemMatchesFilterConfig, wishlistItemsLoading } = useWishlistItems();

  const filteredItems: WishlistItemType[] = useMemo(
    () => wishlistItems.filter(itemMatchesFilterConfig),
    [wishlistItems, itemMatchesFilterConfig]
  );

  if (wishlistItemsLoading) {
    return (
      <Wrapper>
        <div className='spinner col-span-2 w-3 h-3 mx-auto'></div>
      </Wrapper>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <Wrapper>
        <p className='sm:!col-span-2 text-sm font-medium text-description w-fit mx-auto'>No items found</p>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      {filteredItems.map((item: WishlistItemType) => (
        <WishlistItem
          wishlistItem={item}
          key={item.item_id}
        />
      ))}
    </Wrapper>
  );
}

function Wrapper({ children }: { children: ReactNode }): JSX.Element {
  const { isSingleColumnView } = useWishlistItems();

  return (
    <section>
      <Container>
        <div className={`grid grid-cols-1 ${isSingleColumnView ? '' : 'sm:grid-cols-2'} gap-1 items-start`}>{children}</div>
      </Container>
    </section>
  );
}
