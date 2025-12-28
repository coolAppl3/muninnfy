import { JSX, useEffect } from 'react';
import AccountSocialHeader from './components/AccountSocialHeader/AccountSocialHeader';
import useHandleAsyncError, { HandleAsyncErrorFunction } from '../../../hooks/useHandleAsyncError';
import useAccountSocialDetails from '../hooks/useAccountSocialDetails';
import { getAccountSocialDetailsService } from '../../../services/accountServices';
import { CanceledError } from 'axios';

export default function AccountSocial(): JSX.Element {
  const { initialFetchCompleted, setInitialFetchCompleted, setFollowers, setFollowing, setFollowRequests } = useAccountSocialDetails();
  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();

  useEffect(() => {
    if (initialFetchCompleted) {
      return;
    }

    const abortController: AbortController = new AbortController();

    const getSocialDetails = async () => {
      try {
        const { followers, following, followRequests } = (await getAccountSocialDetailsService(abortController.signal)).data;

        setInitialFetchCompleted(true);
        setFollowers(followers);
        setFollowing(following);
        setFollowRequests(followRequests);
      } catch (err: unknown) {
        if (err instanceof CanceledError) {
          return;
        }

        console.log(err);
        handleAsyncError(err);
      }
    };

    getSocialDetails();
    return () => abortController.abort();
  });

  return (
    <>
      <AccountSocialHeader />
    </>
  );
}
