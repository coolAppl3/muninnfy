import { useContext } from 'react';
import WishlistContext, { WishlistContextInterface } from './WishlistContext';

export default function useWishlist(): WishlistContextInterface {
  const context = useContext<WishlistContextInterface | null>(WishlistContext);

  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider.');
  }

  return context;
}
