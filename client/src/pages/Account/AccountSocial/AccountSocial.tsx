import { ComponentType, JSX, useCallback, useEffect } from 'react';
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
import { NotificationDetails } from '../../../types/notificationTypes';
import { FollowDetails, FollowRequest } from '../../../types/socialTypes';
import { subscribeToAccountNotifications } from '../../../services/websockets/accountNotificationsWebsSocket';

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

  const notificationsHandler = useCallback(
    (data: NotificationDetails) => {
      const { notification_type, notification_data } = data;

      if (notification_type === 'new_follow_request') {
        setFollowRequests((prev) => [notification_data as FollowRequest, ...prev]);
        setSocialCounts((prev) => ({ ...prev, follow_requests_count: prev.follow_requests_count + 1 }));

        return;
      }

      const followDetails = notification_data as FollowDetails;

      if (notification_type === 'new_follower') {
        setFollowers((prev) => [followDetails, ...prev]);
        setSocialCounts((prev) => ({ ...prev, followers_count: prev.followers_count + 1 }));

        return;
      }

      setFollowing((prev) => [followDetails, ...prev]);
      setSocialCounts((prev) => ({ ...prev, following_count: prev.following_count + 1 }));
    },
    [setFollowers, setFollowing, setFollowRequests, setSocialCounts]
  );

  useEffect(() => {
    subscribeToAccountNotifications('social', notificationsHandler);
    // unsubscribed when Account unmounts
  }, [notificationsHandler]);

  const MappedComponent: ComponentType = componentRecord[socialSection];

  return (
    <section>
      {!fetchDetails.initialFetchCompleted ? (
        <ContentLoadingSkeleton />
      ) : (
        <>
          <AccountSocialHeader />
          <MappedComponent />
        </>
      )}
    </section>
  );
}

const componentRecord: Record<AccountSocialSection, ComponentType> = {
  followers: AccountSocialFollowers,
  following: AccountSocialFollowing,
  followRequests: AccountSocialFollowRequests,
  findAccount: AccountSocialFindAccount,
};
