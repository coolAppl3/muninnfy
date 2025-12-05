import { JSX, useEffect, useState } from 'react';
import Head from '../../components/Head/Head';
import AccountSidebar from './AccountSidebar/AccountSidebar';
import Container from '../../components/Container/Container';
import AccountContent from './AccountContent/AccountContent';
import AccountLocationProvider from './providers/AccountLocationProvider';
import AccountNavMenu from './AccountNavMenu/AccountNavMenu';
import { AccountDetailsType } from '../../types/accountTypes';
import AccountDetailsProvider from './providers/AccountDetailsProvider';
import LoadingSkeleton from '../../components/LoadingSkeleton/LoadingSkeleton';
import { getAccountDetailsService } from '../../services/accountServices';
import useHandleAsyncError, { HandleAsyncErrorFunction } from '../../hooks/useHandleAsyncError';
import { CanceledError } from 'axios';
import useAuth from '../../hooks/useAuth';

export default function Account(): JSX.Element {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [initialAccountDetails, setInitialAccountDetails] = useState<AccountDetailsType | null>(null);

  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();
  const { setAuthStatus } = useAuth();

  useEffect(() => {
    const abortController: AbortController = new AbortController();

    const getAccountDetails = async () => {
      try {
        const accountDetails: AccountDetailsType = (await getAccountDetailsService(abortController.signal)).data.accountDetails;

        setInitialAccountDetails(accountDetails);
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

        if (status === 404) {
          setAuthStatus('unauthenticated');
        }
      }
    };

    getAccountDetails();

    return () => abortController.abort();
  }, [setAuthStatus, handleAsyncError]);

  return (
    <>
      <Head title='Account - Muninnfy' />

      <AccountLocationProvider>
        {isLoaded && initialAccountDetails ? (
          <AccountDetailsProvider initialAccountDetails={initialAccountDetails}>
            <main className='py-4'>
              <Container className='grid grid-cols-12 items-start gap-1'>
                <AccountSidebar />
                <AccountNavMenu />
                <AccountContent />
              </Container>
            </main>
          </AccountDetailsProvider>
        ) : (
          <LoadingSkeleton />
        )}
      </AccountLocationProvider>
    </>
  );
}
