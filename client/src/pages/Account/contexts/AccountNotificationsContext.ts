import { createContext, Dispatch, SetStateAction } from 'react';
import { NotificationDetails } from '../../../types/notificationTypes';

export type AccountNotificationsContextType = {
  notifications: NotificationDetails[];
  setNotifications: Dispatch<SetStateAction<NotificationDetails[]>>;

  initialFetchCompleted: boolean;
  setInitialFetchCompleted: Dispatch<SetStateAction<boolean>>;
};

const AccountNotificationsContext = createContext<AccountNotificationsContextType | null>(null);
export default AccountNotificationsContext;
