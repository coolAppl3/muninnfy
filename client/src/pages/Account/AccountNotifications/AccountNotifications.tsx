import { JSX, useCallback, useEffect } from 'react';
import ContentLoadingSkeleton from '../components/ContentLoadingSkeleton/ContentLoadingSkeleton';
import useHandleAsyncError, { HandleAsyncErrorFunction } from '../../../hooks/useHandleAsyncError';
import usePopupMessage from '../../../hooks/usePopupMessage';
import useAccountNotifications from '../hooks/useAccountNotifications';
import { getNotificationsBatchService } from '../../../services/notificationServices';
import { NotificationDetails } from '../../../types/notificationTypes';
import { CanceledError } from 'axios';
import NotificationCard from './components/NotificationCard';
import { useAccountNotificationsWebsocket } from '../../../hooks/useAccountNotificationsWebsocket';

export default function AccountNotifications(): JSX.Element {
  const { notifications, initialFetchCompleted, setNotifications, setInitialFetchCompleted } = useAccountNotifications();

  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();
  const { displayPopupMessage } = usePopupMessage();

  const getNotificationsBatch = useCallback(
    async (offset: number, abortSignal: AbortSignal) => {
      try {
        const notificationsBatch: NotificationDetails[] = (await getNotificationsBatchService(offset, abortSignal)).data;

        setNotifications((prev) => [...prev, ...notificationsBatch]);
        setInitialFetchCompleted(true);
      } catch (err: unknown) {
        if (err instanceof CanceledError) {
          return;
        }

        console.log(err);
        const { isHandled, status } = handleAsyncError(err);

        if (isHandled) {
          return;
        }

        if (status === 400) {
          displayPopupMessage('Something went wrong.', 'error');
        }
      }
    },
    [setNotifications, setInitialFetchCompleted, handleAsyncError, displayPopupMessage]
  );

  useEffect(() => {
    if (initialFetchCompleted) {
      return;
    }

    const abortController: AbortController = new AbortController();
    getNotificationsBatch(0, abortController.signal);

    return () => abortController.abort();
  }, [initialFetchCompleted, getNotificationsBatch]);

  const notificationsHandler = useCallback(
    (data: NotificationDetails) => {
      setNotifications((prev) => [data, ...prev]);
    },
    [setNotifications]
  );

  useAccountNotificationsWebsocket(notificationsHandler);

  return (
    <>
      <h3 className='text-title text-md font-normal leading-[3.6rem]'>Notifications</h3>
      <div className='h-line my-1'></div>

      <div className='grid gap-1'>
        {initialFetchCompleted ? (
          notifications.map((notification: NotificationDetails) => (
            <NotificationCard
              key={notification.notification_id}
              notification={notification}
            />
          ))
        ) : (
          <ContentLoadingSkeleton />
        )}
      </div>
    </>
  );
}
