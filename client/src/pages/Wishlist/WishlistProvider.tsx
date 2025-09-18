import { JSX, ReactNode, useMemo, useState } from 'react';
import WishlistContext, { WishlistContextInterface } from './WishlistContext';
import { WishlistDetailsInterface, WishlistItemInterface } from '../../services/wishlistServices';

export default function WishlistProvider({
  initialWishlistId,
  initialWishlistDetails,
  initialWishlistItems,

  children,
}: {
  initialWishlistId: string;
  initialWishlistDetails: WishlistDetailsInterface;
  initialWishlistItems: WishlistItemInterface[];

  children: ReactNode;
}): JSX.Element {
  const [wishlistId, setWishlistId] = useState<string>(initialWishlistId);
  const [wishlistDetails, setWishlistDetails] = useState<WishlistDetailsInterface>(initialWishlistDetails);
  const [wishlistItems, setWishlistItems] = useState<WishlistItemInterface[]>(initialWishlistItems);

  const wishlistItemsTitleSet: Set<string> = useMemo(
    () =>
      new Set(
        wishlistItems.reduce((set: Set<string>, item: WishlistItemInterface) => {
          set.add(item.title.toLowerCase());
          return set;
        }, new Set<string>())
      ),
    [wishlistItems]
  );

  const contextValue: WishlistContextInterface = useMemo(
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
