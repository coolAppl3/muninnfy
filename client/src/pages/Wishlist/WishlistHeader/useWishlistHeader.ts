import { useContext } from 'react';
import WishlistHeaderContext, { WishlistHeaderContextInterface } from './WishlistHeaderContext';

export default function useWishlistHeader(): WishlistHeaderContextInterface {
  const context = useContext<WishlistHeaderContextInterface | null>(WishlistHeaderContext);

  if (!context) {
    throw new Error('useWishlistHeader must be used withing WishlistHeaderProvider.');
  }

  return context;
}
