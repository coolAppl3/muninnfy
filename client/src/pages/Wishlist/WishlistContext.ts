import { createContext, Dispatch, SetStateAction } from 'react';
import { WishlistDetailsType, WishlistItemType } from '../../services/wishlistServices';

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
