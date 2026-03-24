import { JSX, ReactNode, useMemo, useState } from 'react';
import { FollowDetails } from '../../../types/socialTypes';
import ViewAccountSocialDetailsContext, {
  AccountCounts,
  ViewAccountDetailsContextType,
  ViewAccountSocialFetchDetails,
} from '../contexts/ViewAccountDetailsContext';

type ViewAccountDetailsProviderProps = {
  initialAccountCounts: AccountCounts;
  children: ReactNode;
};

export default function ViewAccountDetailsProvider({
  initialAccountCounts,
  children,
}: ViewAccountDetailsProviderProps): JSX.Element {
  const [accountCounts, setAccountCounts] = useState<AccountCounts>(initialAccountCounts);
  const [followers, setFollowers] = useState<FollowDetails[]>([]);
  const [following, setFollowing] = useState<FollowDetails[]>([]);

  const [socialFetchDetails, setSocialFetchDetails] = useState<ViewAccountSocialFetchDetails>({
    initialFetchCompleted: false,
    allFollowersFetched: false,
    allFollowingFetched: false,
  });

  const contextValue: ViewAccountDetailsContextType = useMemo(
    () => ({
      accountCounts,
      setAccountCounts,

      followers,
      setFollowers,

      following,
      setFollowing,

      socialFetchDetails,
      setSocialFetchDetails,
    }),
    [accountCounts, followers, following, socialFetchDetails]
  );

  return (
    <ViewAccountSocialDetailsContext value={contextValue}>
      {children}
    </ViewAccountSocialDetailsContext>
  );
}
