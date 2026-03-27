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

export type ViewAccountDetailsType = Omit<AccountDetailsType, 'email'> & {
  follow_id: number | null;
  follow_request_id: number | null;
  followers_count: number;
  following_count: number;
  wishlists_count: number;
};
