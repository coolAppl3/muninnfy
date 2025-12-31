import { createContext, Dispatch, SetStateAction } from 'react';
import { FollowDetails, FollowRequest } from '../../../types/socialTypes';

export type AccountSocialDetailsContextType = {
  initialFetchCompleted: boolean;
  setInitialFetchCompleted: Dispatch<SetStateAction<boolean>>;

  followers: FollowDetails[];
  setFollowers: Dispatch<SetStateAction<FollowDetails[]>>;

  following: FollowDetails[];
  setFollowing: Dispatch<SetStateAction<FollowDetails[]>>;

  followRequests: FollowRequest[];
  setFollowRequests: Dispatch<SetStateAction<FollowRequest[]>>;
};

const AccountSocialDetailsContext = createContext<AccountSocialDetailsContextType | null>(null);
export default AccountSocialDetailsContext;
