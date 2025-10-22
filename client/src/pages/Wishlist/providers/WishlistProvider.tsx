import { JSX, ReactNode, useMemo, useState } from 'react';
import WishlistContext, { WishlistContextType } from '../contexts/WishlistContext';
import { WishlistDetailsType } from '../../../types/wishlistTypes';

type WishlistProviderProps = {
  initialWishlistId: string;
  initialWishlistDetails: WishlistDetailsType;

  children: ReactNode;
};

export default function WishlistProvider({
  initialWishlistId,
  initialWishlistDetails,

  children,
}: WishlistProviderProps): JSX.Element {
  const [wishlistId, setWishlistId] = useState<string>(initialWishlistId);
  const [wishlistDetails, setWishlistDetails] = useState<WishlistDetailsType>(initialWishlistDetails);

  const contextValue: WishlistContextType = useMemo(
    () => ({
      wishlistId,
      setWishlistId,

      wishlistDetails,
      setWishlistDetails,
    }),
    [wishlistId, wishlistDetails]
  );

  return <WishlistContext.Provider value={contextValue}>{children}</WishlistContext.Provider>;
}
