import { useContext } from 'react';
import AccountNotificationsContext, { AccountNotificationsContextType } from '../contexts/AccountNotificationsContext';

export default function useAccountNotifications(): AccountNotificationsContextType {
  const context = useContext<AccountNotificationsContextType | null>(AccountNotificationsContext);

  if (!context) {
    throw new Error('useAccountNotifications must be used within AccountNotificationsProvider.');
  }

  return context;
}
