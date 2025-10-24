import { JSX, ReactNode, useCallback, useMemo, useState } from 'react';
import WishlistItemsContext, { ItemsFilterConfig, ItemsSortingMode, WishlistItemsContextType } from '../contexts/WishlistItemsContext';
import { WishlistItemType } from '../../../types/wishlistItemTypes';

type WishlistItemsProviderProps = {
  initialWishlistItems: WishlistItemType[];
  children: ReactNode;
};

export default function WishlistItemsProvider({ initialWishlistItems, children }: WishlistItemsProviderProps): JSX.Element {
  const [wishlistItems, setWishlistItems] = useState<WishlistItemType[]>(initialWishlistItems);
  const [itemsFilterConfig, setItemsFilterConfig] = useState<ItemsFilterConfig>(defaultItemsFilterConfig);
  const [itemsSortingMode, setItemsSortingMode] = useState<ItemsSortingMode>('newest_first');
  const [selectionModeActive, setSelectionModeActive] = useState<boolean>(false);
  const [isSingleColumnView, setIsSingleColumnView] = useState<boolean>(false);

  const wishlistItemsTitleSet: Set<string> = useMemo(
    () => new Set<string>(wishlistItems.map((item: WishlistItemType) => item.title.toLowerCase())),
    [wishlistItems]
  );

  const itemMatchesFilterConfig = useCallback(
    (item: WishlistItemType): boolean => {
      const { addedAfterTimestamp, addedBeforeTimestamp, isPurchased, hasLink, titleQuery, tagsSet } = itemsFilterConfig;

      if (addedAfterTimestamp && item.added_on_timestamp < addedAfterTimestamp) {
        return false;
      }

      if (addedBeforeTimestamp && item.added_on_timestamp > addedBeforeTimestamp) {
        return false;
      }

      if (isPurchased !== null && item.is_purchased !== isPurchased) {
        return false;
      }

      if (hasLink !== null && Boolean(item.link) !== hasLink) {
        return false;
      }

      if (!item.title.toLowerCase().includes(titleQuery)) {
        return false;
      }

      if (tagsSet.size === 0) {
        return true;
      }

      return item.tags.some(({ name }) => tagsSet.has(name));
    },
    [itemsFilterConfig]
  );

  const sortWishlistItems = useCallback(
    (explicitSortingMode?: ItemsSortingMode) => {
      const sortingMode: string = explicitSortingMode || itemsSortingMode;

      if (sortingMode === 'newest_first') {
        setWishlistItems((prev) => prev.toSorted((a, b) => b.added_on_timestamp - a.added_on_timestamp));
        return;
      }

      if (sortingMode === 'oldest_first') {
        setWishlistItems((prev) => prev.toSorted((a, b) => a.added_on_timestamp - b.added_on_timestamp));
        return;
      }

      setWishlistItems((prev) => prev.toSorted((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })));
    },
    [itemsSortingMode]
  );

  const contextValue: WishlistItemsContextType = useMemo(
    () => ({
      wishlistItems,
      setWishlistItems,
      wishlistItemsTitleSet,

      itemsFilterConfig,
      setItemsFilterConfig,
      itemMatchesFilterConfig,

      itemsSortingMode,
      setItemsSortingMode,
      sortWishlistItems,

      selectionModeActive,
      setSelectionModeActive,

      isSingleColumnView,
      setIsSingleColumnView,
    }),
    [
      wishlistItems,
      wishlistItemsTitleSet,
      itemsFilterConfig,
      itemMatchesFilterConfig,
      itemsSortingMode,
      sortWishlistItems,
      selectionModeActive,
      isSingleColumnView,
    ]
  );

  return <WishlistItemsContext value={contextValue}>{children}</WishlistItemsContext>;
}

const defaultItemsFilterConfig: ItemsFilterConfig = {
  addedAfterTimestamp: null,
  addedBeforeTimestamp: null,

  isPurchased: null,
  hasLink: null,

  titleQuery: '',
  tagsSet: new Set<string>(),
};
