import { FollowDetails, FollowRequest } from './socialTypes';

export type NotificationType =
  | 'new_follower'
  | 'new_follow_request'
  | 'follow_request_accepted';

export type NotificationDetails = {
  notification_id: number;
  sender_public_account_id: string;
  sender_username: string;
  sender_display_name: string;
  notification_timestamp: number;
  notification_type: NotificationType;
  notification_data: FollowDetails | FollowRequest;
};
