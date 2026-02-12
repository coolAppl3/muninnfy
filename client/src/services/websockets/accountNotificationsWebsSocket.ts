import { NotificationDetails, NotificationType } from '../../types/notificationTypes';
import { FollowDetails, FollowRequest } from '../../types/socialTypes';

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
    const notificationDetails: NotificationDetails | null = parseWebSocketMessageData(e.data);

    if (!notificationDetails) {
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

function parseWebSocketMessageData(data: any): NotificationDetails | null {
  if (typeof data !== 'string') {
    return null;
  }

  try {
    const parsedData = JSON.parse(data);

    if (!isValidNotificationDetails(parsedData)) {
      return null;
    }

    return parsedData;
  } catch (err: unknown) {
    console.log(err);
    return null;
  }
}

function isValidNotificationType(notificationType: unknown): notificationType is NotificationType {
  if (typeof notificationType !== 'string') {
    return false;
  }

  const validNotificationTypes: string[] = ['NEW_FOLLOWER', 'NEW_FOLLOW_REQUEST', 'FOLLOW_REQUEST_ACCEPTED'];
  return validNotificationTypes.includes(notificationType);
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
    !('notification_type' in data) ||
    !('notification_data' in data)
  ) {
    return false;
  }

  const {
    notification_id,
    sender_public_account_id,
    sender_username,
    sender_display_name,
    notification_timestamp,
    notification_type,
    notification_data,
  } = data;

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

  if (!isValidNotificationData(notification_data, notification_type)) {
    return false;
  }

  return true;
}

function isValidNotificationData(
  notificationData: unknown,
  notificationType: NotificationType
): notificationData is FollowDetails | FollowRequest {
  if (typeof notificationData !== 'object' || notificationData === null) {
    return false;
  }

  if (!('public_account_id' in notificationData) || !('username' in notificationData) || !('display_name' in notificationData)) {
    return false;
  }

  const { public_account_id, username, display_name } = notificationData;

  if (typeof public_account_id !== 'string' || typeof username !== 'string' || typeof display_name !== 'string') {
    return false;
  }

  if (notificationType === 'NEW_FOLLOW_REQUEST') {
    if (!('request_id' in notificationData) || !('request_timestamp' in notificationData)) {
      return false;
    }

    if (!Number.isInteger(notificationData.request_id) || !Number.isInteger(notificationData.request_timestamp)) {
      return false;
    }

    return true;
  }

  if (!('follow_id' in notificationData) || !('follow_timestamp' in notificationData)) {
    return false;
  }

  if (!Number.isInteger(notificationData.follow_id) || !Number.isInteger(notificationData.follow_timestamp)) {
    return false;
  }

  return true;
}
