import { createContext, Dispatch, SetStateAction } from 'react';
import { FollowDetails, SocialCounts } from '../../../types/socialTypes';

export type AccountCounts = {
  followers_count: number;
  following_count: number;
  wishlists_count: number;
};

export type ViewAccountSocialFetchDetails = {
  initialFetchCompleted: boolean;

  allFollowersFetched: boolean;
  allFollowingFetched: boolean;
};

export type ViewAccountDetailsContextType = {
  accountCounts: AccountCounts;
  setAccountCounts: Dispatch<SetStateAction<AccountCounts>>;

  followers: FollowDetails[];
  setFollowers: Dispatch<SetStateAction<FollowDetails[]>>;

  following: FollowDetails[];
  setFollowing: Dispatch<SetStateAction<FollowDetails[]>>;

  socialFetchDetails: ViewAccountSocialFetchDetails;
  setSocialFetchDetails: Dispatch<SetStateAction<ViewAccountSocialFetchDetails>>;
};

const ViewAccountDetailsContext = createContext<ViewAccountDetailsContextType | null>(null);
export default ViewAccountDetailsContext;
