export type NotificationType = 'NEW_FOLLOWER' | 'NEW_FOLLOW_REQUEST' | 'FOLLOW_REQUEST_ACCEPTED';

export type NotificationDetails = {
  notification_id: number;
  sender_public_account_id: string;
  sender_username: string;
  sender_display_name: string;
  notification_timestamp: number;
  notification_type: NotificationType;
};
