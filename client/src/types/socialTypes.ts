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
