import { createContext, Dispatch, SetStateAction } from 'react';
import { FollowDetails, FollowRequest } from '../../../types/socialTypes';

export type AccountSocialFetchDetails = {
  initialFetchCompleted: boolean;

  allFollowersFetched: boolean;
  allFollowingFetched: boolean;
  allFollowRequestsFetched: boolean;
};

export type AccountSocialDetailsContextType = {
  followers: FollowDetails[];
  setFollowers: Dispatch<SetStateAction<FollowDetails[]>>;

  following: FollowDetails[];
  setFollowing: Dispatch<SetStateAction<FollowDetails[]>>;

  followRequests: FollowRequest[];
  setFollowRequests: Dispatch<SetStateAction<FollowRequest[]>>;

  fetchDetails: AccountSocialFetchDetails;
  setFetchDetails: Dispatch<SetStateAction<AccountSocialFetchDetails>>;
};

const AccountSocialDetailsContext = createContext<AccountSocialDetailsContextType | null>(null);
export default AccountSocialDetailsContext;
