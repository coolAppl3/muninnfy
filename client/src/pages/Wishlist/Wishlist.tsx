import { JSX, useEffect, useState } from 'react';
import Head from '../../components/Head/Head';
import { NavigateFunction, useNavigate, useParams } from 'react-router-dom';
import { isValidUuid } from '../../utils/validation/generalValidation';
import { getWishlistDetailsService } from '../../services/wishlistServices';
import { CanceledError } from 'axios';
import usePopupMessage from '../../hooks/usePopupMessage';
import WishlistHeaderProvider from './WishlistHeader/context/WishlistHeaderProvider';
import WishlistHeader from './WishlistHeader/WishlistHeader';
import useHistory from '../../hooks/useHistory';
import LoadingSkeleton from '../../components/LoadingSkeleton/LoadingSkeleton';
import WishlistProvider from './providers/WishlistProvider';
import WishlistItems from './WishlistItems/WishlistItems';
import NewWishlistItemFormContainer from './NewWishlistItemFormContainer/NewWishlistItemFormContainer';
import useHandleAsyncError, { HandleAsyncErrorFunction } from '../../hooks/useHandleAsyncError';
import { WishlistDetailsType } from '../../types/wishlistTypes';
import { WishlistItemType } from '../../types/wishlistItemTypes';
import WishlistItemsToolbar from './WishlistItemsToolbar/WishlistItemsToolbar';
import CalendarProvider from '../../providers/CalendarProvider';
import WishlistItemsSelectionContainer from './WishlistItemsSelectionContainer/WishlistItemsSelectionContainer';
import WishlistItemsProvider from './providers/WishlistItemsProvider';

export default function Wishlist(): JSX.Element {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const [initialWishlistProviderData, setInitialWishlistProviderData] = useState<{
    initialWishlistId: string;
    initialWishlistDetails: WishlistDetailsType;
    initialWishlistItems: WishlistItemType[];
    initialWishlistItemsTitleSet: Set<string>;
  } | null>(null);

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
        const { wishlistDetails, wishlistItems } = (await getWishlistDetailsService(wishlistId, abortController.signal)).data;

        if (abortController.signal.aborted) {
          return;
        }

        const initialWishlistItemsTitleSet = wishlistItems.reduce((set: Set<string>, item: WishlistItemType) => {
          set.add(item.title.toLowerCase());
          return set;
        }, new Set<string>());

        setInitialWishlistProviderData({
          initialWishlistId: wishlistId,
          initialWishlistDetails: wishlistDetails,
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

        if (!isHandled || status !== 401) {
          navigate(referrerLocation || '/account');
        }
      }
    };

    getWishlistDetails();

    return () => abortController.abort();
  }, [isLoaded, referrerLocation, urlParams, displayPopupMessage, navigate, handleAsyncError]);

  return (
    <>
      <Head title='Wishlist - Muninnfy' />

      {isLoaded && initialWishlistProviderData ? (
        <WishlistProvider {...initialWishlistProviderData}>
          <main className='py-4 grid gap-2'>
            <WishlistItemsProvider initialWishlistItems={initialWishlistProviderData.initialWishlistItems}>
              <WishlistHeaderProvider>
                <WishlistHeader />
              </WishlistHeaderProvider>

              <NewWishlistItemFormContainer />

              <CalendarProvider>
                <WishlistItemsToolbar />
              </CalendarProvider>

              <WishlistItemsSelectionContainer />
              <WishlistItems />
            </WishlistItemsProvider>
          </main>
        </WishlistProvider>
      ) : (
        <LoadingSkeleton />
      )}
    </>
  );
}
