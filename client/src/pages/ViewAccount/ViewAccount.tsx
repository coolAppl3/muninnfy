import { JSX, useEffect, useState } from 'react';
import Head from '../../components/Head/Head';
import AccountSidebar from '../Account/AccountSidebar/AccountSidebar';
import AccountNavMenu from '../Account/AccountNavMenu/AccountNavMenu';
import AccountLocationProvider from '../Account/providers/AccountLocationProvider';
import { ViewAccountDetailsType } from '../../types/accountTypes';
import Container from '../../components/Container/Container';
import LoadingSkeleton from '../../components/LoadingSkeleton/LoadingSkeleton';
import { NavigateFunction, useNavigate, useParams } from 'react-router-dom';
import { isValidUuid } from '../../utils/validation/generalValidation';
import useHistory from '../../hooks/useHistory';
import useAuth from '../../hooks/useAuth';
import { getViewAccountDetailsService } from '../../services/accountServices';
import { CanceledError } from 'axios';
import useHandleAsyncError, { HandleAsyncErrorFunction } from '../../hooks/useHandleAsyncError';
import AccountSocialProvider from '../Account/providers/AccountSocialProvider';
import ViewAccountContent from './components/ViewAccountContent/ViewAccountContent';
import AccountSocialDetailsProvider from '../Account/providers/AccountSocialDetailsProvider';
import ViewModeProvider from '../../providers/ViewModeProvider';

export default function ViewAccount(): JSX.Element {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [viewAccountDetails, setViewAccountDetails] = useState<ViewAccountDetailsType | null>(
    null
  );

  const { authStatus, setAuthStatus } = useAuth();
  const { referrerLocation } = useHistory();
  const { publicAccountId } = useParams();
  const navigate: NavigateFunction = useNavigate();
  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();

  useEffect(() => {
    if (!publicAccountId || !isValidUuid) {
      navigate(referrerLocation || (authStatus === 'authenticated' ? '/account' : '/home'));
      return;
    }

    const abortController: AbortController = new AbortController();

    const getViewAccountDetails = async () => {
      try {
        const { viewAccountDetails } = (
          await getViewAccountDetailsService(publicAccountId, abortController.signal)
        ).data;

        setViewAccountDetails(viewAccountDetails);
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

        if (status === 400 || status === 404) {
          navigate(referrerLocation || (authStatus === 'authenticated' ? '/account' : '/home'));
        }
      }
    };

    getViewAccountDetails();

    return () => abortController.abort();
  }, [
    publicAccountId,
    referrerLocation,
    authStatus,
    navigate,
    setAuthStatus,
    handleAsyncError,
  ]);

  return (
    <>
      <Head title='View Account - Muninnfy' />

      <ViewModeProvider
        inViewMode={true}
        publicAccountId={viewAccountDetails?.public_account_id}
      >
        <AccountLocationProvider>
          {isLoaded && viewAccountDetails ? (
            <main className='py-4'>
              <Container className='grid grid-cols-12 items-start gap-1'>
                <AccountSidebar />
                <AccountNavMenu />

                <AccountSocialDetailsProvider>
                  <AccountSocialProvider>
                    <ViewAccountContent viewAccountDetails={viewAccountDetails} />
                  </AccountSocialProvider>
                </AccountSocialDetailsProvider>
              </Container>
            </main>
          ) : (
            <LoadingSkeleton />
          )}
        </AccountLocationProvider>
      </ViewModeProvider>
    </>
  );
}
