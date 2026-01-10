import { JSX, ReactNode, useMemo, useState } from 'react';
import { FollowDetails, FollowRequest, SocialCounts } from '../../../types/socialTypes';
import AccountSocialDetailsContext, {
  AccountSocialDetailsContextType,
  AccountSocialFetchDetails,
} from '../contexts/AccountSocialDetailsContext';

type AccountSocialDetailsProviderProps = {
  children: ReactNode;
};

export default function AccountSocialDetailsProvider({ children }: AccountSocialDetailsProviderProps): JSX.Element {
  const [socialCounts, setSocialCounts] = useState<SocialCounts>({ followers_count: 0, following_count: 0, follow_requests_count: 0 });
  const [followers, setFollowers] = useState<FollowDetails[]>([]);
  const [following, setFollowing] = useState<FollowDetails[]>([]);
  const [followRequests, setFollowRequests] = useState<FollowRequest[]>([]);

  const [fetchDetails, setFetchDetails] = useState<AccountSocialFetchDetails>({
    initialFetchCompleted: false,
    allFollowersFetched: false,
    allFollowingFetched: false,
    allFollowRequestsFetched: false,
  });

  const contextValue: AccountSocialDetailsContextType = useMemo(
    () => ({
      socialCounts,
      setSocialCounts,

      followers,
      setFollowers,

      following,
      setFollowing,

      followRequests,
      setFollowRequests,

      fetchDetails,
      setFetchDetails,
    }),
    [socialCounts, followers, following, followRequests, fetchDetails]
  );

  return <AccountSocialDetailsContext value={contextValue}>{children}</AccountSocialDetailsContext>;
}
