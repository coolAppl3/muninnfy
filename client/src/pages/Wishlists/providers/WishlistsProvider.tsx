import { JSX, ReactNode, useCallback, useMemo, useState } from 'react';
import WishlistsContext, { WishlistsContextType, WishlistsFilterConfigType, WishlistsSortingMode } from '../contexts/WishlistsContext';
import { ExtendedWishlistDetailsType } from '../../../types/wishlistTypes';

type WishlistsProviderProps = {
  initialWishlists: ExtendedWishlistDetailsType[];
  children: ReactNode;
};

export default function WishlistsProvider({ initialWishlists, children }: WishlistsProviderProps): JSX.Element {
  const [wishlists, setWishlists] = useState<ExtendedWishlistDetailsType[]>(initialWishlists);
  const [wishlistsFilterConfig, setWishlistsFilterConfig] = useState<WishlistsFilterConfigType>(defaultWishlistsFilterConfig);
  const [wishlistsSortingMode, setWishlistsSortingMode] = useState<WishlistsSortingMode>('interactivity');
  const [isSingleColumnView, setIsSingleColumnView] = useState<boolean>(false);

  const wishlistMatchesFilterConfig = useCallback(
    (wishlist: ExtendedWishlistDetailsType): boolean => {
      const {
        createdAfterTimestamp,
        createdBeforeTimestamp,
        itemsCountFrom,
        itemsCountTo,
        totalItemsPriceFrom,
        totalItemsPriceTo,
        priceToCompleteFrom,
        priceToCompleteTo,
        isFavorited,
        titleQuery,
        crossWishlistQueryIdSet,
      } = wishlistsFilterConfig;

      if (crossWishlistQueryIdSet && !crossWishlistQueryIdSet.has(wishlist.wishlist_id)) {
        return false;
      }

      if (createdAfterTimestamp !== null && wishlist.created_on_timestamp < createdAfterTimestamp) {
        return false;
      }

      if (createdBeforeTimestamp !== null && wishlist.created_on_timestamp > createdBeforeTimestamp) {
        return false;
      }

      if (itemsCountFrom !== null && wishlist.items_count < itemsCountFrom) {
        return false;
      }

      if (itemsCountTo !== null && wishlist.items_count > itemsCountTo) {
        return false;
      }

      if (totalItemsPriceFrom !== null && wishlist.total_items_price < totalItemsPriceFrom) {
        return false;
      }

      if (totalItemsPriceTo !== null && wishlist.total_items_price > totalItemsPriceTo) {
        return false;
      }

      if (priceToCompleteFrom !== null && wishlist.price_to_complete < priceToCompleteFrom) {
        return false;
      }

      if (priceToCompleteTo !== null && wishlist.price_to_complete > priceToCompleteTo) {
        return false;
      }

      if (isFavorited !== null && wishlist.is_favorited !== isFavorited) {
        return false;
      }

      if (!wishlist.title.toLowerCase().includes(titleQuery)) {
        return false;
      }

      return true;
    },
    [wishlistsFilterConfig]
  );

  const sortWishlists = useCallback(
    (explicitSortingMode?: WishlistsSortingMode) => {
      const sortingMode: WishlistsSortingMode = explicitSortingMode || wishlistsSortingMode;

      if (sortingMode === 'newest_first') {
        setWishlists((prev) => prev.toSorted((a, b) => b.created_on_timestamp - a.created_on_timestamp));
        return;
      }

      if (sortingMode === 'oldest_first') {
        setWishlists((prev) => prev.toSorted((a, b) => a.created_on_timestamp - b.created_on_timestamp));
        return;
      }

      if (sortingMode === 'largest_first') {
        setWishlists((prev) => prev.toSorted((a, b) => b.items_count - a.items_count));
        return;
      }

      if (sortingMode === 'smallest_first') {
        setWishlists((prev) => prev.toSorted((a, b) => a.items_count - b.items_count));
        return;
      }

      if (sortingMode === 'lexicographical') {
        setWishlists((prev) => prev.toSorted((a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' })));
        return;
      }

      // sort by interactivity
      setWishlists((prev) =>
        prev.toSorted((a, b) => {
          if (a.interactivity_index === b.interactivity_index) {
            return b.latest_interaction_timestamp - a.latest_interaction_timestamp;
          }

          return b.interactivity_index - a.interactivity_index;
        })
      );
    },
    [wishlistsSortingMode]
  );

  const contextValue: WishlistsContextType = useMemo(
    () => ({
      wishlists,
      setWishlists,

      wishlistsFilterConfig,
      setWishlistsFilterConfig,
      wishlistMatchesFilterConfig,

      wishlistsSortingMode,
      setWishlistsSortingMode,
      sortWishlists,

      isSingleColumnView,
      setIsSingleColumnView,
    }),
    [wishlists, wishlistsFilterConfig, wishlistsSortingMode, isSingleColumnView, sortWishlists, wishlistMatchesFilterConfig]
  );

  return <WishlistsContext value={contextValue}>{children}</WishlistsContext>;
}

const defaultWishlistsFilterConfig: WishlistsFilterConfigType = {
  createdAfterTimestamp: null,
  createdBeforeTimestamp: null,

  itemsCountFrom: null,
  itemsCountTo: null,

  totalItemsPriceFrom: null,
  totalItemsPriceTo: null,

  priceToCompleteFrom: null,
  priceToCompleteTo: null,

  isFavorited: null,
  titleQuery: '',

  itemTitleQuery: '',
  crossWishlistQueryIdSet: null,
};
