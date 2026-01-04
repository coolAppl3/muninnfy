import { JSX, ReactNode, useMemo, useState } from 'react';
import { FollowDetails, FollowRequest } from '../../../types/socialTypes';
import AccountSocialDetailsContext, {
  AccountSocialDetailsContextType,
  AccountSocialFetchDetails,
} from '../contexts/AccountSocialDetailsContext';

type AccountSocialDetailsProviderProps = {
  children: ReactNode;
};

export default function AccountSocialDetailsProvider({ children }: AccountSocialDetailsProviderProps): JSX.Element {
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
      followers,
      setFollowers,

      following,
      setFollowing,

      followRequests,
      setFollowRequests,

      fetchDetails,
      setFetchDetails,
    }),
    [followers, following, followRequests, fetchDetails]
  );

  return <AccountSocialDetailsContext value={contextValue}>{children}</AccountSocialDetailsContext>;
}
