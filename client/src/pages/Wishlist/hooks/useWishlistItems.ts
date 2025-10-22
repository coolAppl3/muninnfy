import { useContext } from 'react';
import WishlistItemsContext, { WishlistItemsContextType } from '../contexts/WishlistItemsContext';

export default function useWishlistItems(): WishlistItemsContextType {
  const context = useContext<WishlistItemsContextType | null>(WishlistItemsContext);

  if (!context) {
    throw new Error('useWishlistItems must be used within WishlistItemsProvider.');
  }

  return context;
}
