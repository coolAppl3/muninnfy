import { createContext, Dispatch, SetStateAction } from 'react';
import { WishlistDetailsType } from '../../../types/wishlistTypes';

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
};

const WishlistContext = createContext<WishlistContextType | null>(null);
export default WishlistContext;
