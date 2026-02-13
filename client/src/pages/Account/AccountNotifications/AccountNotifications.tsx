import { JSX, useCallback, useEffect, useState } from 'react';
import ContentLoadingSkeleton from '../components/ContentLoadingSkeleton/ContentLoadingSkeleton';
import useHandleAsyncError, { HandleAsyncErrorFunction } from '../../../hooks/useHandleAsyncError';
import usePopupMessage from '../../../hooks/usePopupMessage';
import useAccountNotifications from '../hooks/useAccountNotifications';
import { getNotificationsBatchService } from '../../../services/notificationServices';
import { NotificationDetails } from '../../../types/notificationTypes';
import { CanceledError } from 'axios';
import NotificationCard from './components/NotificationCard';
import { subscribeToAccountNotifications } from '../../../services/websockets/accountNotificationsWebsSocket';
import { NOTIFICATIONS_FETCH_BATCH_SIZE, NOTIFICATIONS_RENDER_BATCH_SIZE } from '../../../utils/constants/notificationsConstants';
import Button from '../../../components/Button/Button';

export default function AccountNotifications(): JSX.Element {
  const { notifications, initialFetchCompleted, setNotifications, setInitialFetchCompleted } = useAccountNotifications();

  const [renderLimit, setRenderLimit] = useState<number>(NOTIFICATIONS_RENDER_BATCH_SIZE);
  const [fetchingAdditionalNotifications, setFetchingAdditionalNotifications] = useState<boolean>(false);
  const [allNotificationsFetched, setAllNotificationsFetched] = useState<boolean>(false);

  const allNotificationsRendered: boolean = allNotificationsFetched && renderLimit >= notifications.length;

  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();
  const { displayPopupMessage } = usePopupMessage();

  const getNotificationsBatch = useCallback(
    async (offset: number, abortSignal: AbortSignal) => {
      try {
        const notificationsBatch: NotificationDetails[] = (await getNotificationsBatchService(offset, abortSignal)).data;

        setNotifications((prev) => [...prev, ...notificationsBatch]);
        setInitialFetchCompleted(true);

        if (notificationsBatch.length < NOTIFICATIONS_FETCH_BATCH_SIZE) {
          setAllNotificationsFetched(true);
        }
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

  useEffect(() => {
    subscribeToAccountNotifications('notifications', notificationsHandler);
    // unsubscribed when Account unmounts
  }, [notificationsHandler]);

  return (
    <>
      <h3 className='text-title text-md font-normal leading-[3.6rem]'>Notifications</h3>
      <div className='h-line my-1'></div>

      <div className='grid gap-1'>
        {initialFetchCompleted && notifications.length === 0 && (
          <p className='text-sm text-description w-fit mx-auto'>No notifications found</p>
        )}

        {initialFetchCompleted ? (
          notifications.slice(0, renderLimit).map((notification: NotificationDetails) => (
            <NotificationCard
              key={notification.notification_id}
              notification={notification}
            />
          ))
        ) : (
          <ContentLoadingSkeleton />
        )}

        {fetchingAdditionalNotifications ? (
          <ContentLoadingSkeleton />
        ) : (
          allNotificationsRendered || (
            <Button
              className='bg-description border-description text-dark text-sm py-[4px] w-full sm:w-fit mx-auto rounded-pill'
              onClick={async () => {
                if (allNotificationsRendered) {
                  return;
                }

                setFetchingAdditionalNotifications(true);

                const nextRenderOverflowsFetchedData: boolean = renderLimit + NOTIFICATIONS_RENDER_BATCH_SIZE > notifications.length;
                if (nextRenderOverflowsFetchedData && !allNotificationsFetched) {
                  await getNotificationsBatch(notifications.length, new AbortController().signal);
                }

                setRenderLimit((prev) => prev + NOTIFICATIONS_RENDER_BATCH_SIZE);
                setFetchingAdditionalNotifications(false);
              }}
            >
              Load more
            </Button>
          )
        )}
      </div>
    </>
  );
}
