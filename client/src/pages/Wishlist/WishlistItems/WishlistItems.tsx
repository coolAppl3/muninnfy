import { JSX, Profiler, useMemo } from 'react';
import Container from '../../../components/Container/Container';
import WishlistItem from './WishlistItem/WishlistItem';
import { WishlistItemType } from '../../../types/wishlistItemTypes';
import useWishlistItems from '../hooks/useWishlistItems';

export default function WishlistItems(): JSX.Element {
  const { wishlistItems, itemMatchesFilterConfig, selectionModeActive, isSingleColumnView, setWishlistItems } = useWishlistItems();

  const filteredItems: WishlistItemType[] = useMemo(
    () => wishlistItems.filter(itemMatchesFilterConfig),
    [wishlistItems, itemMatchesFilterConfig]
  );

  return (
    <Profiler
      id='test'
      onRender={(_, __, dur) => console.log(+dur.toFixed(0))}
    >
      <section>
        <Container>
          <div className={`grid grid-cols-1 ${isSingleColumnView ? '' : 'sm:grid-cols-2'} gap-1 items-start`}>
            {filteredItems.length === 0 ? (
              <p className='sm:!col-span-2 text-sm font-medium text-description w-fit mx-auto'>No items found</p>
            ) : (
              filteredItems.map((item: WishlistItemType) => (
                <WishlistItem
                  wishlistItem={item}
                  key={item.item_id}
                  selectionModeActive={selectionModeActive}
                  setWishlistItems={setWishlistItems}
                />
              ))
            )}
          </div>
        </Container>
      </section>
    </Profiler>
  );
}
