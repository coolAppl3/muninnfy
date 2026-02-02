export type SocialCounts = {
  followers_count: number;
  following_count: number;
  follow_requests_count: number;
};

export type BasicSocialData = {
  public_account_id: string;
  username: string;
  display_name: string;
};

export type FollowDetails = BasicSocialData & {
  follow_id: number;
  follow_timestamp: number;
};

export type FollowRequest = BasicSocialData & {
  request_id: number;
  request_timestamp: number;
};

export type SocialSectionType = 'followers' | 'following' | 'followRequests';
