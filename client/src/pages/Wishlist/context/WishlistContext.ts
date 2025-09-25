import { createContext, Dispatch, SetStateAction } from 'react';
import { WishlistDetailsType } from '../../../types/wishlistTypes';
import { WishlistItemType } from '../../../types/wishlistItemTypes';

export type WishlistContextType = {
  wishlistId: string;
  setWishlistId: Dispatch<SetStateAction<string>>;

  wishlistDetails: WishlistDetailsType;
  setWishlistDetails: Dispatch<SetStateAction<WishlistDetailsType>>;

  wishlistItems: WishlistItemType[];
  setWishlistItems: Dispatch<SetStateAction<WishlistItemType[]>>;

  wishlistItemsTitleSet: Set<string>;
};

const WishlistContext = createContext<WishlistContextType | null>(null);
export default WishlistContext;
