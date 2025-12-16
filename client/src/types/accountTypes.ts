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
  request_id: number;
  is_suspended: boolean;
  expiry_timestamp: number;
};
