import { useContext } from 'react';
import WishlistsContext, { WishlistsContextType } from '../contexts/WishlistsContext';

export default function useWishlists(): WishlistsContextType {
  const context = useContext<WishlistsContextType | null>(WishlistsContext);

  if (!context) {
    throw new Error('useWishlists must be used within WishlistsProvider.');
  }

  return context;
}
