import { createContext, Dispatch, SetStateAction } from 'react';
import { ExtendedWishlistDetailsType } from '../../../types/wishlistTypes';

export type WishlistsFilterConfigType = {
  createdAfterTimestamp: number | null;
  createdBeforeTimestamp: number | null;

  itemsCountFrom: number | null;
  itemsCountTo: number | null;

  totalItemsPriceFrom: number | null;
  totalItemsPriceTo: number | null;

  priceToCompleteFrom: number | null;
  priceToCompleteTo: number | null;

  titleQuery: string;
  crossWishlistQueryIdSet: Set<string>;
};

export type WishlistsSortingMode = 'newest_first' | 'oldest_first' | 'largest_first' | 'smallest_first' | 'lexicographical';

export type WishlistsContextType = {
  wishlists: ExtendedWishlistDetailsType[];
  setWishlists: Dispatch<SetStateAction<ExtendedWishlistDetailsType[]>>;

  wishlistsFilterConfig: WishlistsFilterConfigType;
  setWishlistsFilterConfig: Dispatch<SetStateAction<WishlistsFilterConfigType>>;
  wishlistMatchesFilterConfig: (wishlist: ExtendedWishlistDetailsType) => boolean;

  wishlistsSortingMode: WishlistsSortingMode;
  setWishlistsSortingMode: Dispatch<SetStateAction<WishlistsSortingMode>>;
  sortWishlists: (explicitSortingMode?: WishlistsSortingMode) => void;

  isSingleColumnView: boolean;
  setIsSingleColumnView: Dispatch<SetStateAction<boolean>>;
};

const WishlistsContext = createContext<WishlistsContextType | null>(null);
export default WishlistsContext;
