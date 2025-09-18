import { createContext, Dispatch, SetStateAction } from 'react';
import { WishlistDetailsInterface, WishlistItemInterface } from '../../services/wishlistServices';

export interface WishlistContextInterface {
  wishlistId: string;
  setWishlistId: Dispatch<SetStateAction<string>>;

  wishlistDetails: WishlistDetailsInterface;
  setWishlistDetails: Dispatch<SetStateAction<WishlistDetailsInterface>>;

  wishlistItems: WishlistItemInterface[];
  setWishlistItems: Dispatch<SetStateAction<WishlistItemInterface[]>>;

  wishlistItemsTitleSet: Set<string>;
}

const WishlistContext = createContext<WishlistContextInterface | null>(null);
export default WishlistContext;
