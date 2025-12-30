export type AccountDetailsType = {
  public_account_id: string;
  email: string;
  username: string;
  display_name: string;
  created_on_timestamp: number;
  is_private: boolean;
  approve_follow_requests: boolean;
};

export type OngoingAccountRequest = {
  expiry_timestamp: number;
  is_suspended: boolean;
};

type SocialData = {
  public_account_id: string;
  username: string;
  display_name: string;
};

export type FollowDetails = SocialData & {
  follow_id: number;
  follow_timestamp: number;
};

export type FollowRequest = SocialData & {
  request_id: number;
  request_timestamp: number;
};
