import { JSX, ReactNode, useCallback, useMemo, useState } from 'react';
import WishlistContext, { ItemsFilterConfig, WishlistContextType } from './WishlistContext';
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
  const [wishlistItemsLoading, setWishlistItemsLoading] = useState<boolean>(false);
  // const [] = useState<>(false)

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
    }),
    [wishlistId, wishlistDetails, wishlistItems, wishlistItemsTitleSet, wishlistItemsLoading, itemsFilterConfig, itemMatchesFilterConfig]
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
