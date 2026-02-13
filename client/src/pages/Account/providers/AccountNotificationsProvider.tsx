import { JSX, ReactNode, useMemo, useState } from 'react';
import { NotificationDetails } from '../../../types/notificationTypes';
import AccountNotificationsContext, { AccountNotificationsContextType } from '../contexts/AccountNotificationsContext';

type AccountNotificationsProviderProps = {
  children: ReactNode;
};

export default function AccountNotificationsProvider({ children }: AccountNotificationsProviderProps): JSX.Element {
  const [notifications, setNotifications] = useState<NotificationDetails[]>([]);
  const [initialFetchCompleted, setInitialFetchCompleted] = useState<boolean>(false);

  const contextValue: AccountNotificationsContextType = useMemo(
    () => ({
      notifications,
      setNotifications,

      initialFetchCompleted,
      setInitialFetchCompleted,
    }),
    [notifications, initialFetchCompleted]
  );

  return <AccountNotificationsContext value={contextValue}>{children}</AccountNotificationsContext>;
}
