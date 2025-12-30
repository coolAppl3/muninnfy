import { JSX, ReactNode, useMemo, useState } from 'react';
import { FollowDetails, FollowRequest } from '../../../types/accountTypes';
import AccountSocialDetailsContext, { AccountSocialDetailsContextType } from '../contexts/AccountSocialDetailsContext';

type AccountSocialDetailsProviderProps = {
  children: ReactNode;
};

export default function AccountSocialDetailsProvider({ children }: AccountSocialDetailsProviderProps): JSX.Element {
  const [initialFetchCompleted, setInitialFetchCompleted] = useState<boolean>(false);
  const [followers, setFollowers] = useState<FollowDetails[]>([]);
  const [following, setFollowing] = useState<FollowDetails[]>([]);
  const [followRequests, setFollowRequests] = useState<FollowRequest[]>([]);

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
    }),
    [initialFetchCompleted, followers, following, followRequests]
  );

  return <AccountSocialDetailsContext value={contextValue}>{children}</AccountSocialDetailsContext>;
}
