import { useContext } from 'react';
import ViewWishlistContext, { ViewWishlistContextType } from '../contexts/ViewWishlistContext';

export function useViewWishlist(): ViewWishlistContextType {
  const context = useContext<ViewWishlistContextType | null>(ViewWishlistContext);

  if (!context) {
    throw new Error('useViewWishlist must be used within ViewWishlistProvider.');
  }

  return context;
}
