import { JSX, ReactNode, useMemo, useState } from 'react';
import ViewWishlistContext, { ViewWishlistContextType } from '../contexts/ViewWishlistContext';
import { ViewWishlistDetailsType } from '../../../types/wishlistTypes';

type ViewWishlistProviderProps = {
  initialWishlistId: string;
  initialWishlistDetails: ViewWishlistDetailsType;

  children: ReactNode;
};

export default function ViewWishlistProvider({
  initialWishlistId,
  initialWishlistDetails,

  children,
}: ViewWishlistProviderProps): JSX.Element {
  const [wishlistId, setWishlistId] = useState<string>(initialWishlistId);
  const [viewWishlistDetails, setViewWishlistDetails] = useState<ViewWishlistDetailsType>(initialWishlistDetails);

  const contextValue: ViewWishlistContextType = useMemo(
    () => ({
      wishlistId,
      setWishlistId,

      wishlistDetails: viewWishlistDetails,
      setWishlistDetails: setViewWishlistDetails,
    }),
    [wishlistId, viewWishlistDetails]
  );

  return <ViewWishlistContext value={contextValue}>{children}</ViewWishlistContext>;
}
