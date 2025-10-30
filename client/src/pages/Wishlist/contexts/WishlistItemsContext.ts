import { createContext, Dispatch, SetStateAction } from 'react';
import { WishlistItemType } from '../../../types/wishlistItemTypes';

export type ItemsFilterConfigType = {
  addedAfterTimestamp: number | null;
  addedBeforeTimestamp: number | null;

  purchasedAfterTimestamp: number | null;
  purchasedBeforeTimestamp: number | null;

  priceFrom: number | null;
  priceTo: number | null;

  isPurchased: boolean | null;
  hasLink: boolean | null;
  hasPrice: boolean | null;

  titleQuery: string;
  tagsSet: Set<string>;
};

export type ItemsSortingMode = 'newest_first' | 'oldest_first' | 'cheapest_first' | 'priciest_first' | 'lexicographical';

export type WishlistItemsContextType = {
  wishlistItems: WishlistItemType[];
  setWishlistItems: Dispatch<SetStateAction<WishlistItemType[]>>;
  wishlistItemsTitleSet: Set<string>;

  itemsFilterConfig: ItemsFilterConfigType;
  setItemsFilterConfig: Dispatch<SetStateAction<ItemsFilterConfigType>>;
  itemMatchesFilterConfig: (item: WishlistItemType) => boolean;

  itemsSortingMode: ItemsSortingMode;
  setItemsSortingMode: Dispatch<SetStateAction<ItemsSortingMode>>;
  sortWishlistItems: (explicitSortingMode?: ItemsSortingMode) => void;

  selectionModeActive: boolean;
  setSelectionModeActive: Dispatch<SetStateAction<boolean>>;

  isSingleColumnView: boolean;
  setIsSingleColumnView: Dispatch<SetStateAction<boolean>>;
};

const WishlistItemsContext = createContext<WishlistItemsContextType | null>(null);
export default WishlistItemsContext;
