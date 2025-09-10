import { JSX, ReactNode, useMemo, useState } from 'react';
import WishlistContext, { WishlistContextInterface } from './WishlistContext';
import { WishlistDetails, WishlistItem } from '../../services/wishlistServices';

export default function WishlistProvider({
  initialWishlistId,
  initialWishlistDetails,
  initialWishlistItems,
  children,
}: {
  initialWishlistId: string;
  initialWishlistDetails: WishlistDetails;
  initialWishlistItems: WishlistItem[];
  children: ReactNode;
}): JSX.Element {
  const [wishlistId, setWishlistId] = useState<string>(initialWishlistId);
  const [wishlistDetails, setWishlistDetails] = useState<WishlistDetails>(initialWishlistDetails);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(initialWishlistItems);

  const contextValue: WishlistContextInterface = useMemo(
    () => ({
      wishlistId,
      setWishlistId,

      wishlistDetails,
      setWishlistDetails,

      wishlistItems,
      setWishlistItems,
    }),
    [wishlistId, wishlistDetails, wishlistItems]
  );

  return <WishlistContext.Provider value={contextValue}>{children}</WishlistContext.Provider>;
}
