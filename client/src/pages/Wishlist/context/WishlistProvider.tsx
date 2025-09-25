import { JSX, ReactNode, useMemo, useState } from 'react';
import WishlistContext, { WishlistContextType } from './WishlistContext';
import { WishlistDetailsType } from '../../../types/wishlistTypes';
import { WishlistItemType } from '../../../types/wishlistItemTypes';

export default function WishlistProvider({
  initialWishlistId,
  initialWishlistDetails,
  initialWishlistItems,

  children,
}: {
  initialWishlistId: string;
  initialWishlistDetails: WishlistDetailsType;
  initialWishlistItems: WishlistItemType[];

  children: ReactNode;
}): JSX.Element {
  const [wishlistId, setWishlistId] = useState<string>(initialWishlistId);
  const [wishlistDetails, setWishlistDetails] = useState<WishlistDetailsType>(initialWishlistDetails);
  const [wishlistItems, setWishlistItems] = useState<WishlistItemType[]>(initialWishlistItems);

  const wishlistItemsTitleSet: Set<string> = useMemo(
    () =>
      new Set(
        wishlistItems.reduce((set: Set<string>, item: WishlistItemType) => {
          set.add(item.title.toLowerCase());
          return set;
        }, new Set<string>())
      ),
    [wishlistItems]
  );

  const contextValue: WishlistContextType = useMemo(
    () => ({
      wishlistId,
      setWishlistId,

      wishlistDetails,
      setWishlistDetails,

      wishlistItems,
      setWishlistItems,

      wishlistItemsTitleSet,
    }),
    [wishlistId, wishlistDetails, wishlistItems, wishlistItemsTitleSet]
  );

  return <WishlistContext.Provider value={contextValue}>{children}</WishlistContext.Provider>;
}
