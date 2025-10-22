import { useContext } from 'react';
import WishlistContext, { WishlistContextType } from '../contexts/WishlistContext';

export default function useWishlist(): WishlistContextType {
  const context = useContext<WishlistContextType | null>(WishlistContext);

  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider.');
  }

  return context;
}
