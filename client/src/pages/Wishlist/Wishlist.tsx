import { JSX, useCallback, useEffect, useState } from 'react';
import { Head } from '../../components/Head/Head';
import useLoadingOverlay from '../../hooks/useLoadingOverlay';
import { NavigateFunction, useLocation, useNavigate } from 'react-router-dom';
import { isValidUuid } from '../../utils/validation/generalValidation';
import useInfoModal from '../../hooks/useInfoModal';
import { getWishlistDetailsService, WishlistDetails, WishlistItem } from '../../services/wishlistServices';
import { CanceledError } from 'axios';
import { AsyncErrorData, getAsyncErrorData } from '../../utils/errorUtils';
import usePopupMessage from '../../hooks/usePopupMessage';
import WishlistHeader from './WishlistHeader';
import { FOLLOWERS_WISHLIST_PRIVACY_LEVEL } from '../../utils/constants/wishlistConstants';

export default function Wishlist(): JSX.Element {
  const [wishlistId, setWishlistId] = useState<string | null>(null);
  const [wishlistDetails, setWishlistDetails] = useState<WishlistDetails | null>(null);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  const { pathname } = useLocation();
  const navigate: NavigateFunction = useNavigate();
  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();
  const { displayInfoModal, removeInfoModal } = useInfoModal();
  const { displayPopupMessage } = usePopupMessage();

  const handleInvalidWishlistId: () => void = useCallback(() => {
    displayInfoModal({
      title: 'Invalid wishlist ID.',
      description: `It looks like the wishlist ID in your URL is invalid.\nMake sure you're using the correct link.`,
      btnTitle: 'Go to homepage',
      onClick: removeInfoModal,
    });
  }, [displayInfoModal, removeInfoModal]);

  useEffect(() => {
    displayLoadingOverlay();
    const wishlistId: string = pathname.slice(10);

    if (!isValidUuid(wishlistId)) {
      removeLoadingOverlay();
      handleInvalidWishlistId();

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
          handleInvalidWishlistId();
          return;
        }

        if ([401, 404].includes(status)) {
          navigate('/home');
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
  }, [displayLoadingOverlay, removeLoadingOverlay, displayPopupMessage, handleInvalidWishlistId, pathname, navigate]);

  return (
    <>
      <Head title={`${wishlistDetails ? wishlistDetails.title : 'Wishlist'} - Muninnfy`} />

      <main className='py-4'>
        {wishlistDetails && (
          <WishlistHeader
            wishlistDetails={wishlistDetails}
            wishlistId={wishlistId || ''}
          />
        )}
      </main>
    </>
  );
}
