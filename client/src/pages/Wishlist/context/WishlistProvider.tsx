import { JSX, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import WishlistContext, { ItemsFilterConfig, ItemsSortingMode, WishlistContextType } from './WishlistContext';
import { WishlistDetailsType } from '../../../types/wishlistTypes';
import { WishlistItemType } from '../../../types/wishlistItemTypes';

type WishlistProviderProps = {
  initialWishlistId: string;
  initialWishlistDetails: WishlistDetailsType;
  initialWishlistItems: WishlistItemType[];

  children: ReactNode;
};

export default function WishlistProvider({
  initialWishlistId,
  initialWishlistDetails,
  initialWishlistItems,

  children,
}: WishlistProviderProps): JSX.Element {
  const [wishlistId, setWishlistId] = useState<string>(initialWishlistId);
  const [wishlistDetails, setWishlistDetails] = useState<WishlistDetailsType>(initialWishlistDetails);
  const [wishlistItems, setWishlistItems] = useState<WishlistItemType[]>(initialWishlistItems);
  const [itemsFilterConfig, setItemsFilterConfig] = useState<ItemsFilterConfig>(defaultItemsFilterConfig);
  const [itemsSortingMode, setItemsSortingMode] = useState<ItemsSortingMode>('newest_first');
  const [wishlistItemsLoading, setWishlistItemsLoading] = useState<boolean>(false);
  const [selectionModeActive, setSelectionModeActive] = useState<boolean>(false);
  const [selectedItemsSet, setSelectedItemsSet] = useState<Set<number>>(new Set<number>());
  const [isSingleColumnView, setIsSingleColumnView] = useState<boolean>(false);
  const [expandedItemsSet, setExpandedItemsSet] = useState<Set<number>>(new Set<number>());

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

  const sortWishlistItems = useCallback(() => {
    if (itemsSortingMode === 'newest_first') {
      setWishlistItems((prev) => prev.toSorted((a, b) => b.added_on_timestamp - a.added_on_timestamp));
      return;
    }

    if (itemsSortingMode === 'oldest_first') {
      setWishlistItems((prev) => prev.toSorted((a, b) => a.added_on_timestamp - b.added_on_timestamp));
      return;
    }

    setWishlistItems((prev) => prev.toSorted((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })));
  }, [itemsSortingMode]);

  useEffect(() => {
    sortWishlistItems();
  }, [itemsSortingMode, sortWishlistItems]);

  const contextValue: WishlistContextType = useMemo(
    () => ({
      wishlistId,
      setWishlistId,

      wishlistDetails,
      setWishlistDetails,

      wishlistItems,
      setWishlistItems,
      wishlistItemsTitleSet,

      wishlistItemsLoading,
      setWishlistItemsLoading,

      itemsFilterConfig,
      setItemsFilterConfig,
      itemMatchesFilterConfig,

      itemsSortingMode,
      setItemsSortingMode,
      sortWishlistItems,

      selectionModeActive,
      setSelectionModeActive,

      selectedItemsSet,
      setSelectedItemsSet,

      isSingleColumnView,
      setIsSingleColumnView,

      expandedItemsSet,
      setExpandedItemsSet,
    }),
    [
      wishlistId,
      wishlistDetails,
      wishlistItems,
      wishlistItemsTitleSet,
      wishlistItemsLoading,
      itemsFilterConfig,
      itemMatchesFilterConfig,
      itemsSortingMode,
      sortWishlistItems,
      selectionModeActive,
      selectedItemsSet,
      isSingleColumnView,
      expandedItemsSet,
    ]
  );

  return <WishlistContext.Provider value={contextValue}>{children}</WishlistContext.Provider>;
}

const defaultItemsFilterConfig: ItemsFilterConfig = {
  addedAfterTimestamp: null,
  addedBeforeTimestamp: null,

  isPurchased: null,
  hasLink: null,

  titleQuery: '',
  tagsSet: new Set<string>(),
};
