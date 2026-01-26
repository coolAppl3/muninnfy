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
import { SOCIAL_FETCH_BATCH_SIZE } from '../../../utils/constants/socialConstants';

export default function AccountSocial(): JSX.Element {
  const { socialSection } = useAccountSocial();
  const { fetchDetails, setFetchDetails, setSocialCounts, setFollowers, setFollowing, setFollowRequests } = useAccountSocialDetails();

  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();

  useEffect(() => {
    if (fetchDetails.initialFetchCompleted) {
      return;
    }

    const abortController: AbortController = new AbortController();

    const getSocialDetails = async () => {
      try {
        const { socialCounts, followers, following, followRequests } = (await getAccountSocialDetailsService(abortController.signal)).data;

        setSocialCounts({ ...socialCounts });
        setFollowers(followers);
        setFollowing(following);
        setFollowRequests(followRequests);

        setFetchDetails({
          initialFetchCompleted: true,

          allFollowersFetched: followers.length < SOCIAL_FETCH_BATCH_SIZE,
          allFollowingFetched: following.length < SOCIAL_FETCH_BATCH_SIZE,
          allFollowRequestsFetched: followRequests.length < SOCIAL_FETCH_BATCH_SIZE,
        });
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
  }, [fetchDetails, setFetchDetails, setSocialCounts, setFollowers, setFollowing, setFollowRequests, handleAsyncError]);

  return (
    <>
      {!fetchDetails.initialFetchCompleted ? (
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
