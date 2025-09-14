import { JSX, ReactNode, useMemo, useState } from 'react';
import WishlistContext, { WishlistContextInterface } from './WishlistContext';
import { WishlistDetails, WishlistItem } from '../../services/wishlistServices';

export default function WishlistProvider({
  initialWishlistId,
  initialWishlistDetails,
  initialWishlistItems,
  initialWishlistItemsTitleSet,

  children,
}: {
  initialWishlistId: string;
  initialWishlistDetails: WishlistDetails;
  initialWishlistItems: WishlistItem[];
  initialWishlistItemsTitleSet: Set<string>;

  children: ReactNode;
}): JSX.Element {
  const [wishlistId, setWishlistId] = useState<string>(initialWishlistId);
  const [wishlistDetails, setWishlistDetails] = useState<WishlistDetails>(initialWishlistDetails);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(initialWishlistItems);
  const [wishlistItemsTitleSet, setWishlistItemsTitleSet] = useState<Set<string>>(new Set(initialWishlistItemsTitleSet));

  const contextValue: WishlistContextInterface = useMemo(
    () => ({
      wishlistId,
      setWishlistId,

      wishlistDetails,
      setWishlistDetails,

      wishlistItems,
      setWishlistItems,

      wishlistItemsTitleSet,
      setWishlistItemsTitleSet,
    }),
    [wishlistId, wishlistDetails, wishlistItems, wishlistItemsTitleSet]
  );

  return <WishlistContext.Provider value={contextValue}>{children}</WishlistContext.Provider>;
}
