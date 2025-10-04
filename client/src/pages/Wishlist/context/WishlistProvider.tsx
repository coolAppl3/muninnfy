import { JSX, ReactNode, useCallback, useMemo, useState } from 'react';
import WishlistContext, { ItemsFilterConfig, WishlistContextType } from './WishlistContext';
import { WishlistDetailsType } from '../../../types/wishlistTypes';
import { WishlistItemType } from '../../../types/wishlistItemTypes';

const defaultItemsFilterConfig: ItemsFilterConfig = {
  addedAfterTimestamp: null,
  addedBeforeTimestamp: null,

  isPurchased: null,
  hasLink: null,

  titleQuery: '',
  tagsSet: new Set(),
};

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

  const wishlistItemsTitleSet: Set<string> = useMemo(
    () => new Set(wishlistItems.map((item: WishlistItemType) => item.title.toLowerCase())),
    [wishlistItems]
  );

  const itemMatchesFilterConfig = useCallback(
    (item: WishlistItemType): boolean => {
      const { addedAfterTimestamp, addedBeforeTimestamp, isPurchased, hasLink, titleQuery, tagsSet } = itemsFilterConfig;

      if (addedAfterTimestamp) {
        return item.added_on_timestamp < addedAfterTimestamp;
      }

      if (addedBeforeTimestamp) {
        return item.added_on_timestamp > addedBeforeTimestamp;
      }

      if (isPurchased !== null) {
        return item.is_purchased === isPurchased;
      }

      if (hasLink !== null) {
        return Boolean(item.link) === hasLink;
      }

      if (!item.title.includes(titleQuery)) {
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

      setItemsFilterConfig,
      itemMatchesFilterConfig,
    }),
    [wishlistId, wishlistDetails, wishlistItems, wishlistItemsTitleSet, itemMatchesFilterConfig]
  );

  return <WishlistContext.Provider value={contextValue}>{children}</WishlistContext.Provider>;
}
