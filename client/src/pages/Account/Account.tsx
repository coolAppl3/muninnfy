import { JSX, useEffect, useState } from 'react';
import Head from '../../components/Head/Head';
import AccountSidebar from './AccountSidebar/AccountSidebar';
import Container from '../../components/Container/Container';
import AccountContent from './AccountContent/AccountContent';
import AccountLocationProvider from './providers/AccountLocationProvider';
import AccountNavMenu from './AccountNavMenu/AccountNavMenu';
import { AccountDetailsType, OngoingAccountRequest } from '../../types/accountTypes';
import AccountDetailsProvider from './providers/AccountDetailsProvider';
import LoadingSkeleton from '../../components/LoadingSkeleton/LoadingSkeleton';
import { getAccountDetailsService } from '../../services/accountServices';
import useHandleAsyncError, { HandleAsyncErrorFunction } from '../../hooks/useHandleAsyncError';
import { CanceledError } from 'axios';
import useAuth from '../../hooks/useAuth';
import AccountOngoingRequestsProvider from './providers/AccountOngoingRequestsProvider';
import AccountSocialDetailsProvider from './providers/AccountSocialDetailsProvider';
import AccountNotificationsProvider from './providers/AccountNotificationsProvider';

export default function Account(): JSX.Element {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [initialAccountDetails, setInitialAccountDetails] = useState<AccountDetailsType | null>(null);

  const [initialOngoingEmailUpdateRequest, setInitialOngoingEmailUpdateRequest] = useState<
    (OngoingAccountRequest & { new_email: string }) | null
  >(null);
  const [initialOngoingAccountDeletionRequest, setInitialOngoingAccountDeletionRequest] = useState<OngoingAccountRequest | null>(null);

  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();
  const { setAuthStatus } = useAuth();

  useEffect(() => {
    const abortController: AbortController = new AbortController();

    const getAccountDetails = async () => {
      try {
        const { accountDetails, ongoingEmailUpdateRequest, ongoingAccountDeletionRequest } = (
          await getAccountDetailsService(abortController.signal)
        ).data;

        setInitialAccountDetails(accountDetails);
        setInitialOngoingEmailUpdateRequest(ongoingEmailUpdateRequest);
        setInitialOngoingAccountDeletionRequest(ongoingAccountDeletionRequest);

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
          <main className='py-4'>
            <Container className='grid grid-cols-12 items-start gap-1'>
              <AccountSidebar />
              <AccountNavMenu />

              <AccountDetailsProvider initialAccountDetails={initialAccountDetails}>
                <AccountOngoingRequestsProvider
                  initialOngoingEmailUpdateRequest={initialOngoingEmailUpdateRequest}
                  initialOngoingAccountDeletionRequest={initialOngoingAccountDeletionRequest}
                >
                  <AccountSocialDetailsProvider>
                    <AccountNotificationsProvider>
                      <AccountContent />
                    </AccountNotificationsProvider>
                  </AccountSocialDetailsProvider>
                </AccountOngoingRequestsProvider>
              </AccountDetailsProvider>
            </Container>
          </main>
        ) : (
          <LoadingSkeleton />
        )}
      </AccountLocationProvider>
    </>
  );
}
