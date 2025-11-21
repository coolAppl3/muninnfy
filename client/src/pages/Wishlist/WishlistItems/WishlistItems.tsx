import { JSX, useMemo } from 'react';
import Container from '../../../components/Container/Container';
import WishlistItem from './WishlistItem/WishlistItem';
import { WishlistItemType } from '../../../types/wishlistItemTypes';
import useWishlistItems from '../hooks/useWishlistItems';

export default function WishlistItems(): JSX.Element {
  const { wishlistItems, selectionModeActive, isSingleColumnView, itemsFilterConfig, itemMatchesFilterConfig, setWishlistItems } =
    useWishlistItems();

  const filteredItems: WishlistItemType[] = useMemo(
    () => wishlistItems.filter(itemMatchesFilterConfig),
    [wishlistItems, itemMatchesFilterConfig]
  );

  const filtersAppliedCount: number = Object.entries(itemsFilterConfig).reduce(
    (acc: number, [key, value]: [string, number | string | boolean | Set<string> | null]) => {
      if (value === null) {
        return acc;
      }

      if (key === 'requireAllFilterTags' || key === 'titleQuery') {
        return acc;
      }

      if (key === 'tagsSet' && typeof value === 'object') {
        return value.size > 0 ? acc + 1 : acc;
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
                Showing {filteredItems.length} of {wishlistItems.length}
              </p>
            </div>

            <div className='h-line mt-1 mb-2'></div>
          </>
        )}

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
  );
}
