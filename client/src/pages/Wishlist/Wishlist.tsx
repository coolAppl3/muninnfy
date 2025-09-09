import { JSX, useEffect, useState } from 'react';
import { Head } from '../../components/Head/Head';
import useLoadingOverlay from '../../hooks/useLoadingOverlay';
import { NavigateFunction, useNavigate, useParams } from 'react-router-dom';
import { isValidUuid } from '../../utils/validation/generalValidation';
import { getWishlistDetailsService, WishlistDetails, WishlistItem } from '../../services/wishlistServices';
import { CanceledError } from 'axios';
import { AsyncErrorData, getAsyncErrorData } from '../../utils/errorUtils';
import usePopupMessage from '../../hooks/usePopupMessage';
import WishlistHeaderProvider from './WishlistHeader/WishlistHeaderProvider';
import WishlistHeader from './WishlistHeader/WishlistHeader';
import useAuth from '../../hooks/useAuth';
import useHistory from '../../hooks/useHistory';

export default function Wishlist(): JSX.Element {
  const [wishlistId, setWishlistId] = useState<string | null>(null);
  const [wishlistDetails, setWishlistDetails] = useState<WishlistDetails | null>(null);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  const { setAuthStatus } = useAuth();
  const { referrerLocation } = useHistory();
  const urlParams = useParams();
  const navigate: NavigateFunction = useNavigate();
  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();
  const { displayPopupMessage } = usePopupMessage();

  useEffect(() => {
    displayLoadingOverlay();
    const wishlistId: string | undefined = urlParams.wishlistId;

    if (!wishlistId || !isValidUuid(wishlistId)) {
      displayPopupMessage('Wishlist not found.', 'error');
      removeLoadingOverlay();

      navigate(referrerLocation ? referrerLocation : '/account');
      return;
    }

    setWishlistId(wishlistId);

    let ignore: boolean = false;
    const abortController: AbortController = new AbortController();

    const getWishlistDetails = async () => {
      try {
        const { wishlistDetails, wishlistItems } = (await getWishlistDetailsService(wishlistId, abortController.signal)).data;

        if (ignore) {
          return;
        }

        setWishlistDetails(wishlistDetails);
        setWishlistItems(wishlistItems);
      } catch (err: unknown) {
        if (ignore || err instanceof CanceledError) {
          return;
        }

        console.log(err);
        const asyncErrorData: AsyncErrorData | null = getAsyncErrorData(err);

        if (!asyncErrorData) {
          displayPopupMessage('Something went wrong.', 'error');
          return;
        }

        const { status, errMessage } = asyncErrorData;
        displayPopupMessage(errMessage, 'error');

        if (status === 400) {
          navigate(referrerLocation ? referrerLocation : '/account');
          return;
        }

        if (status === 401) {
          setAuthStatus('unauthenticated');
          return;
        }

        if (status === 404) {
          navigate(referrerLocation ? referrerLocation : '/account');
        }
      } finally {
        removeLoadingOverlay();
      }
    };

    getWishlistDetails();

    return () => {
      ignore = true;
      abortController.abort();

      removeLoadingOverlay();
    };
  }, [displayLoadingOverlay, removeLoadingOverlay, displayPopupMessage, setAuthStatus, referrerLocation, urlParams, navigate]);

  return (
    <>
      <Head title={`${wishlistDetails ? wishlistDetails.title : 'Wishlist'} - Muninnfy`} />

      <main className='py-4'>
        <WishlistHeaderProvider>
          {wishlistDetails && (
            <WishlistHeader
              wishlistId={wishlistId || ''}
              wishlistDetails={wishlistDetails}
              setWishlistDetails={setWishlistDetails}
            />
          )}
        </WishlistHeaderProvider>
      </main>
    </>
  );
}
