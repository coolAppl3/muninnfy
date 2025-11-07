import { JSX, useEffect, useState } from 'react';
import Head from '../../components/Head/Head';
import Container from '../../components/Container/Container';
import WishlistCard from '../../components/WishlistCard/WishlistCard';
import { ExtendedWishlistDetailsType } from '../../types/wishlistTypes';
import { getAllWishlistsService } from '../../services/wishlistServices';
import { CanceledError } from 'axios';
import useAsyncErrorHandler, { HandleAsyncErrorFunction } from '../../hooks/useAsyncErrorHandler';
import LoadingSkeleton from '../../components/LoadingSkeleton/LoadingSkeleton';

export default function Wishlists(): JSX.Element {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [wishlists, setWishlists] = useState<ExtendedWishlistDetailsType[]>([]);

  const handleAsyncError: HandleAsyncErrorFunction = useAsyncErrorHandler();

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
        handleAsyncError(err);
      }
    };

    getAllWishlists();

    return () => abortController.abort();
  }, [handleAsyncError]);

  return (
    <>
      <Head title='Wishlists - Muninnfy' />

      {isLoaded ? (
        <main className='py-4 grid gap-2'>
          <section>
            <Container>
              <div className='grid gap-1 sm:grid-cols-2'>
                {wishlists.map((wishlist: ExtendedWishlistDetailsType) => (
                  <WishlistCard
                    key={wishlist.wishlist_id}
                    {...wishlist}
                  />
                ))}
              </div>
            </Container>
          </section>
        </main>
      ) : (
        <LoadingSkeleton />
      )}
    </>
  );
}
