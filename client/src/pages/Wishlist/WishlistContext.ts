import { createContext, Dispatch, SetStateAction } from 'react';
import { WishlistDetails, WishlistItem } from '../../services/wishlistServices';

export interface WishlistContextInterface {
  wishlistId: string;
  setWishlistId: Dispatch<SetStateAction<string>>;

  wishlistDetails: WishlistDetails;
  setWishlistDetails: Dispatch<SetStateAction<WishlistDetails>>;

  wishlistItems: WishlistItem[];
  setWishlistItems: Dispatch<SetStateAction<WishlistItem[]>>;
}

const WishlistContext = createContext<WishlistContextInterface | null>(null);
export default WishlistContext;
