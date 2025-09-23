import { useContext } from 'react';
import WishlistHeaderContext, { WishlistHeaderContextType } from './WishlistHeaderContext';

export default function useWishlistHeader(): WishlistHeaderContextType {
  const context = useContext<WishlistHeaderContextType | null>(WishlistHeaderContext);

  if (!context) {
    throw new Error('useWishlistHeader must be used withing WishlistHeaderProvider.');
  }

  return context;
}
