import { JSX, memo } from 'react';
import { NotificationDetails, NotificationType } from '../../../../types/notificationTypes';
import { getDateAndTimeString } from '../../../../utils/globalUtils';

type NotificationCardProps = {
  notification: NotificationDetails;
};

export default memo(NotificationCard);
function NotificationCard({ notification }: NotificationCardProps): JSX.Element {
  const { notification_type, notification_timestamp, sender_public_account_id, sender_username, sender_display_name } = notification;

  const notificationDescription: string = getNotificationDescription(notification_type);

  return (
    <div className='p-1 bg-primary rounded text-description text-sm'>
      <p className='text-title'>
        {sender_display_name} (@{sender_username}) {notificationDescription}
      </p>

      <div className='text-xs text-description/50 mt-1'>
        <p>{getDateAndTimeString(notification_timestamp, true)}</p>
        <p>{sender_public_account_id}</p>
      </div>
    </div>
  );
}

function getNotificationDescription(notificationType: NotificationType): string {
  if (notificationType === 'NEW_FOLLOWER') {
    return 'started following you.';
  }

  if (notificationType === 'NEW_FOLLOW_REQUEST') {
    return 'requested to follow you.';
  }

  return 'accepted your follow request.';
}
