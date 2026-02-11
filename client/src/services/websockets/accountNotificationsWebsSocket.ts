import { NotificationDetails, NotificationType } from '../../types/notificationTypes';

let ws: WebSocket | null = null;
const wsListenersSet = new Set<(data: NotificationDetails) => void>();

let reconnectionDelayMilliseconds: number = 1000;
const maxReconnectionDelayMilliseconds: number = 1000 * 60 * 5;

export function connectAccountNotificationsWebSocket(): void {
  ws = new WebSocket('ws://localhost:5000/');

  ws.addEventListener('open', () => {
    reconnectionDelayMilliseconds = 1000;
  });

  ws.addEventListener('message', (e: MessageEvent) => {
    const notificationDetails = e.data;

    if (!isValidNotificationDetails(notificationDetails)) {
      return;
    }

    wsListenersSet.forEach((listener: (data: NotificationDetails) => void) => listener(notificationDetails));
  });

  ws.addEventListener('close', (e: CloseEvent) => {
    if (e.code === 1000 || e.code === 1001) {
      return;
    }

    setTimeout(connectAccountNotificationsWebSocket, reconnectionDelayMilliseconds);
    reconnectionDelayMilliseconds = Math.min(reconnectionDelayMilliseconds * 2, maxReconnectionDelayMilliseconds);
  });

  ws.addEventListener('error', () => {
    ws?.close();
  });
}

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
