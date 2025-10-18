import { createContext, Dispatch, SetStateAction } from 'react';
import { WishlistDetailsType } from '../../../types/wishlistTypes';
import { WishlistItemType } from '../../../types/wishlistItemTypes';

export type ItemsFilterConfig = {
  addedAfterTimestamp: number | null;
  addedBeforeTimestamp: number | null;

  isPurchased: boolean | null;
  hasLink: boolean | null;

  titleQuery: string;
  tagsSet: Set<string>;
};

export type ItemsSortingMode = 'newest_first' | 'oldest_first' | 'lexicographical';

export type WishlistContextType = {
  wishlistId: string;
  setWishlistId: Dispatch<SetStateAction<string>>;

  wishlistDetails: WishlistDetailsType;
  setWishlistDetails: Dispatch<SetStateAction<WishlistDetailsType>>;

  wishlistItems: WishlistItemType[];
  setWishlistItems: Dispatch<SetStateAction<WishlistItemType[]>>;
  wishlistItemsTitleSet: Set<string>;

  wishlistItemsLoading: boolean;
  setWishlistItemsLoading: Dispatch<SetStateAction<boolean>>;

  itemsFilterConfig: ItemsFilterConfig;
  setItemsFilterConfig: Dispatch<SetStateAction<ItemsFilterConfig>>;
  itemMatchesFilterConfig: (item: WishlistItemType) => boolean;

  itemsSortingMode: ItemsSortingMode;
  setItemsSortingMode: Dispatch<SetStateAction<ItemsSortingMode>>;
  sortWishlistItems: () => void;

  selectionModeActive: boolean;
  setSelectionModeActive: Dispatch<SetStateAction<boolean>>;

  isSingleColumnView: boolean;
  setIsSingleColumnView: Dispatch<SetStateAction<boolean>>;
};

const WishlistContext = createContext<WishlistContextType | null>(null);
export default WishlistContext;
