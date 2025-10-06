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

export type WishlistContextType = {
  wishlistId: string;
  setWishlistId: Dispatch<SetStateAction<string>>;

  wishlistDetails: WishlistDetailsType;
  setWishlistDetails: Dispatch<SetStateAction<WishlistDetailsType>>;

  wishlistItems: WishlistItemType[];
  setWishlistItems: Dispatch<SetStateAction<WishlistItemType[]>>;

  wishlistItemsTitleSet: Set<string>;

  itemsFilterConfig: ItemsFilterConfig;
  setItemsFilterConfig: Dispatch<SetStateAction<ItemsFilterConfig>>;
  itemMatchesFilterConfig: (item: WishlistItemType) => boolean;
};

const WishlistContext = createContext<WishlistContextType | null>(null);
export default WishlistContext;
