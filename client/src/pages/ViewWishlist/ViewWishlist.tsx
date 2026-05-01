import { JSX, useEffect, useState } from 'react';
import Head from '../../components/Head/Head';
import { WishlistItemType } from '../../types/wishlistItemTypes';
import { ViewWishlistDetailsType, ViewWishlistOwnerDetails } from '../../types/wishlistTypes';
import useHandleAsyncError, { HandleAsyncErrorFunction } from '../../hooks/useHandleAsyncError';
import useHistory from '../../hooks/useHistory';
import { NavigateFunction, useNavigate, useParams } from 'react-router-dom';
import usePopupMessage from '../../hooks/usePopupMessage';
import { isValidUuid } from '../../utils/validation/generalValidation';
import { getViewWishlistDetailsService } from '../../services/wishlistServices';
import { CanceledError } from 'axios';
import LoadingSkeleton from '../../components/LoadingSkeleton/LoadingSkeleton';
import WishlistItemsProvider from '../Wishlist/providers/WishlistItemsProvider';
import CalendarProvider from '../../providers/CalendarProvider';
import WishlistItemsToolbar from '../Wishlist/WishlistItemsToolbar/WishlistItemsToolbar';
import WishlistItems from '../Wishlist/WishlistItems/WishlistItems';
import useAuth from '../../hooks/useAuth';
import ViewWishlistHeader from './components/ViewWishlistHeader';
import ViewModeProvider from '../../providers/ViewModeProvider';
import { DisplayPopupMessageFunction } from '../../contexts/PopupMessageContext';

export default function ViewWishlist(): JSX.Element {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const [ownerDetails, setOwnerDetails] = useState<ViewWishlistOwnerDetails | null>(null);
  const [viewWishlistDetails, setViewWishlistDetails] =
    useState<ViewWishlistDetailsType | null>(null);
  const [wishlistItems, setWishlistItems] = useState<WishlistItemType[]>([]);

  const { authStatus } = useAuth();
  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();
  const { referrerLocation } = useHistory();
  const urlParams = useParams();
  const navigate: NavigateFunction = useNavigate();
  const displayPopupMessage: DisplayPopupMessageFunction = usePopupMessage();

  useEffect(() => {
    if (isLoaded) {
      return;
    }

    const wishlistId: string | undefined = urlParams.wishlistId;

    if (!wishlistId || !isValidUuid(wishlistId)) {
      displayPopupMessage('Wishlist not found.', 'error');
      navigate(referrerLocation || '/account');

      return;
    }

    const abortController: AbortController = new AbortController();

    const getViewWishlistDetails = async () => {
      try {
        const { ownerDetails, viewWishlistDetails, wishlistItems } = (
          await getViewWishlistDetailsService(wishlistId, abortController.signal)
        ).data;

        if (abortController.signal.aborted) {
          return;
        }

        setOwnerDetails(ownerDetails);
        setViewWishlistDetails(viewWishlistDetails);
        setWishlistItems(wishlistItems);

        setIsLoaded(true);
      } catch (err: unknown) {
        if (err instanceof CanceledError) {
          return;
        }

        console.log(err);
        const { isHandled, status } = handleAsyncError(err);

        if (isHandled) {
          return;
        }

        if (status === 409) {
          displayPopupMessage('Loading your wishlist.', 'success');
          navigate(`/wishlist/${wishlistId}`, { replace: true });

          return;
        }

        navigate(referrerLocation || (authStatus === 'authenticated' ? '/account' : '/home'));
      }
    };

    getViewWishlistDetails();

    return () => abortController.abort();
  }, [
    isLoaded,
    referrerLocation,
    authStatus,
    urlParams,
    displayPopupMessage,
    navigate,
    handleAsyncError,
  ]);

  return (
    <>
      <Head
        title='View Wishlist - Muninnfy'
        metaDescription={`Explore what ${ownerDetails?.owner_display_name || 'this user'} has wishlisted.`}
      />

      {isLoaded || <LoadingSkeleton />}

      <ViewModeProvider
        inViewMode={true}
        publicAccountId={ownerDetails?.owner_public_account_id}
      >
        {isLoaded && ownerDetails && viewWishlistDetails && (
          <main className='py-4 grid gap-2'>
            <WishlistItemsProvider initialWishlistItems={wishlistItems}>
              <ViewWishlistHeader
                ownerDetails={ownerDetails}
                viewWishlistDetails={viewWishlistDetails}
              />

              <CalendarProvider>
                <WishlistItemsToolbar />
              </CalendarProvider>

              <WishlistItems />
            </WishlistItemsProvider>
          </main>
        )}
      </ViewModeProvider>
    </>
  );
}
