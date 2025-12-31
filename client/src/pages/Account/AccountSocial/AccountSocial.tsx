import { JSX, useEffect } from 'react';
import AccountSocialHeader from './components/AccountSocialHeader/AccountSocialHeader';
import useHandleAsyncError, { HandleAsyncErrorFunction } from '../../../hooks/useHandleAsyncError';
import useAccountSocialDetails from '../hooks/useAccountSocialDetails';
import { getAccountSocialDetailsService } from '../../../services/socialServices';
import { CanceledError } from 'axios';
import ContentLoadingSkeleton from '../components/ContentLoadingSkeleton/ContentLoadingSkeleton';
import { AccountSocialSection } from '../contexts/AccountSocialContext';
import useAccountSocial from '../hooks/useAccountSocial';
import AccountSocialFollowers from './components/AccountSocialFollowers/AccountSocialFollowers';
import AccountSocialFollowing from './components/AccountSocialFollowing/AccountSocialFollowing';
import AccountSocialFollowRequests from './components/AccountSocialFollowRequests/AccountSocialFollowRequests';
import AccountSocialFindAccount from './components/AccountSocialFindAccount/AccountSocialFindAccount';

export default function AccountSocial(): JSX.Element {
  const { socialSection } = useAccountSocial();
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
  }, [initialFetchCompleted, setInitialFetchCompleted, setFollowers, setFollowing, setFollowRequests, handleAsyncError]);

  return (
    <>
      {!initialFetchCompleted ? (
        <ContentLoadingSkeleton />
      ) : (
        <>
          <AccountSocialHeader />
          {contentRecord[socialSection]}
        </>
      )}
    </>
  );
}

const contentRecord: Record<AccountSocialSection, JSX.Element> = {
  FOLLOWERS: <AccountSocialFollowers />,
  FOLLOWING: <AccountSocialFollowing />,
  FOLLOW_REQUESTS: <AccountSocialFollowRequests />,
  FIND_ACCOUNT: <AccountSocialFindAccount />,
};
