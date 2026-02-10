import { useEffect } from 'react';
import { subscribeToAccountNotifications } from '../services/websockets/accountNotificationsWebsSocket';
import { NotificationDetails } from '../types/notificationTypes';

export function useAccountNotificationsWebsocket(handler: (data: NotificationDetails) => void): void {
  useEffect(() => {
    return subscribeToAccountNotifications(handler);
  }, [handler]);
}
