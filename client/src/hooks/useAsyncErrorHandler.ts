import { useCallback } from 'react';
import { AsyncErrorData, getAsyncErrorData } from '../utils/errorUtils';
import useAuth from './useAuth';
import useInfoModal from './useInfoModal';
import usePopupMessage from './usePopupMessage';

type HandleAsyncErrorData = AsyncErrorData & { isHandled: boolean };
export type HandleAsyncErrorFunction = (err: unknown) => HandleAsyncErrorData;

export default function useAsyncErrorHandler(): HandleAsyncErrorFunction {
  const { setAuthStatus } = useAuth();
  const { displayPopupMessage } = usePopupMessage();
  const { displayInfoModal, removeInfoModal } = useInfoModal();

  const handleAsyncError = useCallback(
    (err: unknown): HandleAsyncErrorData => {
      let isHandled: boolean = false;
      const asyncErrorData: AsyncErrorData | null = getAsyncErrorData(err);

      if (!asyncErrorData) {
        displayPopupMessage('Something went wrong.', 'error');
        return { isHandled: true, status: 0, errMessage: 'Something went wrong.' };
      }

      const { status, errMessage, errReason, errResData } = asyncErrorData;
      displayPopupMessage(errMessage, 'error');

      if (status === 500) {
        isHandled = true;
      }

      if (status === 401 && errReason === 'authSessionExpired') {
        setAuthStatus('unauthenticated');

        isHandled = true;
      }

      if (status === 429) {
        displayInfoModal({
          title: 'Please slow down.',
          description: `You're making too many requests and have been suspended.\nYou'll be allowed to make requests again within 30-60 seconds.`,
          btnTitle: 'Okay',
          onClick: removeInfoModal,
        });

        isHandled = true;
      }

      return { isHandled, status, errMessage, errReason, errResData };
    },
    [setAuthStatus, displayPopupMessage, displayInfoModal, removeInfoModal]
  );

  return handleAsyncError;
}
