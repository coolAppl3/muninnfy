import { JSX, useEffect, useState } from 'react';
import Head from '../../components/Head/Head';
import { ViewWishlistDetails } from '../../types/wishlistTypes';
import {
  CombinedWishlistsStatistics,
  getAllViewWishlistsService,
} from '../../services/wishlistServices';
import { CanceledError } from 'axios';
import useHandleAsyncError, { HandleAsyncErrorFunction } from '../../hooks/useHandleAsyncError';
import LoadingSkeleton from '../../components/LoadingSkeleton/LoadingSkeleton';
import WishlistsProvider from '../Wishlists/providers/WishlistsProvider';
import WishlistsContainer from '../Wishlists/WishlistsContainer/WishlistsContainer';
import WishlistsToolbar from '../Wishlists/WishlistsToolbar/WishlistsToolbar';
import { NavigateFunction, useNavigate, useParams } from 'react-router-dom';
import useHistory from '../../hooks/useHistory';
import WishlistsHeader from '../Wishlists/WishlistsHeader/WishlistsHeader';
import ViewModeProvider from '../../providers/ViewModeProvider';
import useAuth from '../../hooks/useAuth';
import usePopupMessage from '../../hooks/usePopupMessage';
import { DisplayPopupMessageFunction } from '../../contexts/PopupMessageContext';

export default function ViewWishlists(): JSX.Element {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [wishlists, setWishlists] = useState<ViewWishlistDetails[]>([]);
  const [combinedWishlistsStatistics, setCombinedWishlistsStatistics] =
    useState<CombinedWishlistsStatistics | null>(null);
  const [ownerDetails, setOwnerDetails] = useState<{
    owner_username: string;
    owner_display_name: string;
  } | null>(null);

  const { publicAccountId } = useParams();
  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();
  const { authStatus } = useAuth();
  const { referrerLocation } = useHistory();
  const navigate: NavigateFunction = useNavigate();
  const displayPopupMessage: DisplayPopupMessageFunction = usePopupMessage();

  useEffect(() => {
    if (!publicAccountId) {
      displayPopupMessage('Account not found.', 'error');
      navigate(referrerLocation || (authStatus === 'authenticated' ? '/account' : '/home'));

      return;
    }

    const abortController: AbortController = new AbortController();

    const getAllViewWishlists = async () => {
      try {
        const {
          wishlists: fetchedWishlists,
          combinedWishlistsStatistics,
          ownerDetails,
        } = (await getAllViewWishlistsService(publicAccountId, abortController.signal)).data;

        if (abortController.signal.aborted) {
          return;
        }

        setWishlists(fetchedWishlists);
        setCombinedWishlistsStatistics(combinedWishlistsStatistics);
        setOwnerDetails(ownerDetails);

        setIsLoaded(true);
      } catch (err: unknown) {
        if (err instanceof CanceledError) {
          return;
        }

        console.log(err);
        const { isHandled } = handleAsyncError(err);

        if (isHandled) {
          return;
        }

        navigate(referrerLocation || (authStatus === 'authenticated' ? '/account' : '/home'));
      }
    };

    getAllViewWishlists();

    return () => abortController.abort();
  }, [
    handleAsyncError,
    navigate,
    displayPopupMessage,
    referrerLocation,
    publicAccountId,
    authStatus,
  ]);

  return (
    <>
      <Head title='View Wishlists - Muninnfy' />

      {isLoaded || <LoadingSkeleton />}
      {isLoaded && (
        <ViewModeProvider
          inViewMode={true}
          publicAccountId={publicAccountId}
        >
          <WishlistsProvider initialWishlists={wishlists}>
            <main className='py-4 grid gap-2'>
              {combinedWishlistsStatistics && ownerDetails && (
                <WishlistsHeader
                  combinedWishlistsStatistics={combinedWishlistsStatistics}
                  ownerDetails={ownerDetails}
                />
              )}
              <WishlistsToolbar />
              <WishlistsContainer />
            </main>
          </WishlistsProvider>
        </ViewModeProvider>
      )}
    </>
  );
}
