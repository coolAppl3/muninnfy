import { JSX, ReactNode, useMemo, useState } from 'react';
import { FollowDetails, FollowRequest } from '../../../types/socialTypes';
import AccountSocialDetailsContext, { AccountSocialDetailsContextType } from '../contexts/AccountSocialDetailsContext';

type AccountSocialDetailsProviderProps = {
  children: ReactNode;
};

export default function AccountSocialDetailsProvider({ children }: AccountSocialDetailsProviderProps): JSX.Element {
  const [initialFetchCompleted, setInitialFetchCompleted] = useState<boolean>(false);

  const [followers, setFollowers] = useState<FollowDetails[]>([]);
  const [following, setFollowing] = useState<FollowDetails[]>([]);
  const [followRequests, setFollowRequests] = useState<FollowRequest[]>([]);

  const [allFollowersFetched, setAllFollowersFetched] = useState<boolean>(false);
  const [allFollowingFetched, setAllFollowingFetched] = useState<boolean>(false);
  const [allFollowRequestsFetched, setAllFollowRequestsFetched] = useState<boolean>(false);

  const contextValue: AccountSocialDetailsContextType = useMemo(
    () => ({
      initialFetchCompleted,
      setInitialFetchCompleted,

      followers,
      setFollowers,

      following,
      setFollowing,

      followRequests,
      setFollowRequests,

      allFollowersFetched,
      setAllFollowersFetched,

      allFollowingFetched,
      setAllFollowingFetched,

      allFollowRequestsFetched,
      setAllFollowRequestsFetched,
    }),
    [initialFetchCompleted, followers, following, followRequests, allFollowersFetched, allFollowingFetched, allFollowRequestsFetched]
  );

  return <AccountSocialDetailsContext value={contextValue}>{children}</AccountSocialDetailsContext>;
}
