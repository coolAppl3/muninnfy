import { NotificationDetails, NotificationType } from '../../types/notificationTypes';

const ws: WebSocket = new WebSocket('ws://localhost:5000/');
const wsListenersSet = new Set<(data: NotificationDetails) => void>();

ws.addEventListener('message', (e: MessageEvent) => {
  const notificationDetails = e.data;

  if (!isValidNotificationDetails(notificationDetails)) {
    return;
  }

  wsListenersSet.forEach((listener: (data: NotificationDetails) => void) => listener(notificationDetails));
});

export function subscribeToAccountNotifications(fn: (data: NotificationDetails) => void): () => void {
  wsListenersSet.add(fn);
  return () => wsListenersSet.delete(fn);
}

function isValidNotificationDetails(data: unknown): data is NotificationDetails {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  if (
    !('notification_id' in data) ||
    !('sender_public_account_id' in data) ||
    !('sender_username' in data) ||
    !('sender_display_name' in data) ||
    !('notification_timestamp' in data) ||
    !('notification_type' in data)
  ) {
    return false;
  }

  const { notification_id, sender_public_account_id, sender_username, sender_display_name, notification_timestamp, notification_type } =
    data;

  if (
    typeof notification_id !== 'number' ||
    typeof notification_timestamp !== 'number' ||
    !Number.isInteger(notification_id) ||
    !Number.isInteger(notification_timestamp)
  ) {
    return false;
  }

  if (typeof sender_public_account_id !== 'string' || typeof sender_username !== 'string' || typeof sender_display_name !== 'string') {
    return false;
  }

  if (!isValidNotificationType(notification_type)) {
    return false;
  }

  return true;
}

function isValidNotificationType(notificationType: unknown): notificationType is NotificationType {
  if (typeof notificationType !== 'string') {
    return false;
  }

  const validNotificationTypes: string[] = ['NEW_FOLLOWER', 'NEW_FOLLOW_REQUEST', 'FOLLOW_REQUEST_ACCEPTED'];
  return validNotificationTypes.includes(notificationType);
}
