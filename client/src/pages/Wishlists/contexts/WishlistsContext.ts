import { createContext, Dispatch, SetStateAction } from 'react';
import { ExtendedWishlistDetailsType, ViewWishlistDetails } from '../../../types/wishlistTypes';

export type WishlistsFilterConfigType = {
  createdAfterTimestamp: number | null;
  createdBeforeTimestamp: number | null;

  itemsCountFrom: number | null;
  itemsCountTo: number | null;

  totalItemsPriceFrom: number | null;
  totalItemsPriceTo: number | null;

  priceToCompleteFrom: number | null;
  priceToCompleteTo: number | null;

  isFavorited: boolean | null;
  titleQuery: string;

  itemTitleQuery: string;
  crossWishlistQueryIdSet: Set<string> | null;
};

export type WishlistsSortingMode =
  | 'interactivity'
  | 'newest'
  | 'oldest'
  | 'largest'
  | 'smallest'
  | 'lexicographical';

export type WishlistsContextType = {
  wishlists: (ExtendedWishlistDetailsType | ViewWishlistDetails)[];
  setWishlists: Dispatch<SetStateAction<(ExtendedWishlistDetailsType | ViewWishlistDetails)[]>>;

  wishlistsFilterConfig: WishlistsFilterConfigType;
  setWishlistsFilterConfig: Dispatch<SetStateAction<WishlistsFilterConfigType>>;
  wishlistMatchesFilterConfig: (
    wishlist: ExtendedWishlistDetailsType | ViewWishlistDetails
  ) => boolean;

  wishlistsSortingMode: WishlistsSortingMode;
  setWishlistsSortingMode: Dispatch<SetStateAction<WishlistsSortingMode>>;
  sortWishlists: (explicitSortingMode?: WishlistsSortingMode) => void;

  isSingleColumnView: boolean;
  setIsSingleColumnView: Dispatch<SetStateAction<boolean>>;
};

const WishlistsContext = createContext<WishlistsContextType | null>(null);
export default WishlistsContext;
