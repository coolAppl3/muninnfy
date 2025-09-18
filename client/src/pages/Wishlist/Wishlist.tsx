import { JSX, useEffect, useState } from 'react';
import './Wishlist.css';
import { Head } from '../../components/Head/Head';
import { NavigateFunction, useNavigate, useParams } from 'react-router-dom';
import { isValidUuid } from '../../utils/validation/generalValidation';
import { getWishlistDetailsService, WishlistDetailsInterface, WishlistItemInterface } from '../../services/wishlistServices';
import { CanceledError } from 'axios';
import { AsyncErrorData, getAsyncErrorData } from '../../utils/errorUtils';
import usePopupMessage from '../../hooks/usePopupMessage';
import WishlistHeaderProvider from './WishlistHeader/WishlistHeaderProvider';
import WishlistHeader from './WishlistHeader/WishlistHeader';
import useAuth from '../../hooks/useAuth';
import useHistory from '../../hooks/useHistory';
import LoadingSkeleton from '../../components/LoadingSkeleton/LoadingSkeleton';
import WishlistProvider from './WishlistProvider';
import WishlistItems from './WishlistItems/WishlistItems';
import NewWishlistItemFormContainer from './NewWishlistItemFormContainer/NewWishlistItemForm';

export default function Wishlist(): JSX.Element {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const [initialWishlistProviderData, setInitialWishlistProviderData] = useState<{
    initialWishlistId: string;
    initialWishlistDetails: WishlistDetailsInterface;
    initialWishlistItems: WishlistItemInterface[];
    initialWishlistItemsTitleSet: Set<string>;
  } | null>(null);

  const { setAuthStatus } = useAuth();
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
      navigate(referrerLocation ? referrerLocation : '/account');

      return;
    }

    let ignore: boolean = false;
    const abortController: AbortController = new AbortController();

    const getWishlistDetails = async () => {
      try {
        const { wishlistDetails, wishlistItems } = (await getWishlistDetailsService(wishlistId, abortController.signal)).data;

        if (ignore) {
          return;
        }

        const initialWishlistItemsTitleSet = wishlistItems.reduce((set: Set<string>, item: WishlistItemInterface) => {
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

        if (status === 401) {
          setAuthStatus('unauthenticated');
          return;
        }

        navigate(referrerLocation ? referrerLocation : '/account');
      }
    };

    getWishlistDetails();

    return () => {
      ignore = true;
      abortController.abort();
    };
  }, [isLoaded, displayPopupMessage, setAuthStatus, referrerLocation, urlParams, navigate]);

  return (
    <>
      <Head title='Wishlist - Muninnfy' />

      {isLoaded && initialWishlistProviderData ? (
        <WishlistProvider {...initialWishlistProviderData}>
          <main>
            <WishlistHeaderProvider>
              <WishlistHeader />
            </WishlistHeaderProvider>

            <NewWishlistItemFormContainer />
            <WishlistItems />
          </main>
        </WishlistProvider>
      ) : (
        <LoadingSkeleton />
      )}
    </>
  );
}
