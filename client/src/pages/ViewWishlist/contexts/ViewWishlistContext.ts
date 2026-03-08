import { createContext, Dispatch, SetStateAction } from 'react';
import { ViewWishlistDetailsType } from '../../../types/wishlistTypes';

export type ViewWishlistContextType = {
  wishlistId: string;
  setWishlistId: Dispatch<SetStateAction<string>>;

  wishlistDetails: ViewWishlistDetailsType;
  setWishlistDetails: Dispatch<SetStateAction<ViewWishlistDetailsType>>;
};

const ViewWishlistContext = createContext<ViewWishlistContextType | null>(null);
export default ViewWishlistContext;
