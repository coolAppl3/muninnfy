import { JSX, useEffect, useState } from 'react';
import Head from '../../components/Head/Head';
import { ExtendedWishlistDetailsType } from '../../types/wishlistTypes';
import { getAllWishlistsService } from '../../services/wishlistServices';
import { CanceledError } from 'axios';
import useAsyncErrorHandler, { HandleAsyncErrorFunction } from '../../hooks/useAsyncErrorHandler';
import LoadingSkeleton from '../../components/LoadingSkeleton/LoadingSkeleton';
import WishlistsProvider from './providers/WishlistsProvider';
import WishlistsContainer from './WishlistsContainer/WishlistsContainer';
import { WishlistsToolbar } from './WishlistsToolbar/WishlistsToolbar';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import useHistory from '../../hooks/useHistory';

export default function Wishlists(): JSX.Element {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [wishlists, setWishlists] = useState<ExtendedWishlistDetailsType[]>([]);

  const handleAsyncError: HandleAsyncErrorFunction = useAsyncErrorHandler();
  const navigate: NavigateFunction = useNavigate();
  const { referrerLocation } = useHistory();

  useEffect(() => {
    const abortController: AbortController = new AbortController();

    const getAllWishlists = async () => {
      try {
        const fetchedWishlists: ExtendedWishlistDetailsType[] = (await getAllWishlistsService(abortController.signal)).data;

        if (abortController.signal.aborted) {
          return;
        }

        setWishlists(fetchedWishlists);
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

    getAllWishlists();

    return () => abortController.abort();
  }, [handleAsyncError, navigate, referrerLocation]);

  return (
    <>
      <Head title='Wishlists - Muninnfy' />

      {isLoaded ? (
        <WishlistsProvider initialWishlists={wishlists}>
          <main className='py-4 grid gap-2'>
            <WishlistsToolbar />
            <WishlistsContainer />
          </main>
        </WishlistsProvider>
      ) : (
        <LoadingSkeleton />
      )}
    </>
  );
}
