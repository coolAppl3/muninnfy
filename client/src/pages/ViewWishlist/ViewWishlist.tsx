import { JSX, useEffect, useState } from 'react';
import Head from '../../components/Head/Head';
import { WishlistItemType } from '../../types/wishlistItemTypes';
import { ViewWishlistDetailsType } from '../../types/wishlistTypes';
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

export default function ViewWishlist(): JSX.Element {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const [initialViewWishlistProviderData, setInitialViewWishlistProviderData] = useState<{
    initialWishlistId: string;
    initialViewWishlistDetails: ViewWishlistDetailsType;
    initialWishlistItems: WishlistItemType[];
    initialWishlistItemsTitleSet: Set<string>;
  } | null>(null);

  const { authStatus } = useAuth();
  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();
  const { referrerLocation } = useHistory();
  const urlParams = useParams();
  const navigate: NavigateFunction = useNavigate();
  const { displayPopupMessage } = usePopupMessage();

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

    const getWishlistDetails = async () => {
      try {
        const { viewWishlistDetails, wishlistItems } = (await getViewWishlistDetailsService(wishlistId, abortController.signal)).data;

        if (abortController.signal.aborted) {
          return;
        }

        const initialWishlistItemsTitleSet = wishlistItems.reduce((set: Set<string>, item: WishlistItemType) => {
          set.add(item.title.toLowerCase());
          return set;
        }, new Set<string>());

        setInitialViewWishlistProviderData({
          initialWishlistId: wishlistId,
          initialViewWishlistDetails: viewWishlistDetails,
          initialWishlistItems: wishlistItems,
          initialWishlistItemsTitleSet,
        });

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

    getWishlistDetails();

    return () => abortController.abort();
  }, [isLoaded, referrerLocation, authStatus, urlParams, displayPopupMessage, navigate, handleAsyncError]);

  return (
    <>
      <Head title='View Wishlist - Muninnfy' />

      {isLoaded || <LoadingSkeleton />}

      {isLoaded && initialViewWishlistProviderData && (
        <main className='py-4 grid gap-2'>
          <WishlistItemsProvider initialWishlistItems={initialViewWishlistProviderData.initialWishlistItems}>
            <ViewWishlistHeader viewWishlistDetails={initialViewWishlistProviderData.initialViewWishlistDetails} />

            <CalendarProvider>
              <WishlistItemsToolbar inViewMode={true} />
            </CalendarProvider>

            <WishlistItems inViewMode={true} />
          </WishlistItemsProvider>
        </main>
      )}
    </>
  );
}
