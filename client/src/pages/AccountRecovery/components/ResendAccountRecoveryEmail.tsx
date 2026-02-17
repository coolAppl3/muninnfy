import { Dispatch, JSX, SetStateAction, useState } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import Button from '../../../components/Button/Button';
import useHandleAsyncError, { HandleAsyncErrorFunction } from '../../../hooks/useHandleAsyncError';
import { resendAccountRecoveryEmailService } from '../../../services/accountServices';
import usePopupMessage from '../../../hooks/usePopupMessage';
import useLoadingOverlay from '../../../hooks/useLoadingOverlay';
import { getDateAndTimeString } from '../../../utils/globalUtils';
import useAuth from '../../../hooks/useAuth';

type ResendAccountRecoveryEmailProps = {
  publicAccountId: string;
  setIsValidRecoveryLink: Dispatch<SetStateAction<boolean>>;
};

export default function ResendAccountRecoveryEmail({
  publicAccountId,
  setIsValidRecoveryLink,
}: ResendAccountRecoveryEmailProps): JSX.Element {
  const [title, setTitle] = useState<string>('Account recovery in progress.');
  const [description, setDescription] = useState<string>('Check your inbox for a recovery email and click the link to continue.');

  const [btnDisabled, setBtnDisabled] = useState<boolean>(false);
  const [btnTitle, setBtnTitle] = useState<string>('Resend email');
  const [btnNavigateLocation, setBtnNavigateLocation] = useState<string | null>(null);

  const { setAuthStatus } = useAuth();
  const navigate: NavigateFunction = useNavigate();
  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();
  const { displayPopupMessage } = usePopupMessage();
  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();

  async function resendAccountRecoveryEmail(): Promise<void> {
    try {
      await resendAccountRecoveryEmailService({ publicAccountId });
      displayPopupMessage('Email resent.', 'success');
    } catch (err: unknown) {
      console.log(err);
      const { isHandled, status, errMessage, errReason, errResData } = handleAsyncError(err);

      if (isHandled) {
        return;
      }

      if (status === 400) {
        displayPopupMessage('Invalid recovery link.', 'error');
        setIsValidRecoveryLink(false);

        return;
      }

      setTitle(errMessage);
      setBtnTitle('Go to homepage');
      setBtnNavigateLocation('/home');

      if (status === 404) {
        setDescription(
          errReason === 'accountNotFound' ? 'You can sign up to Muninnfy any time.' : 'You can initiate a new recovery request if needed.'
        );

        return;
      }

      if (status !== 403) {
        return;
      }

      if (errReason === 'signedIn') {
        setAuthStatus('authenticated');
        return;
      }

      if (errReason === 'requestSuspended') {
        handleRequestSuspended(errResData);
        return;
      }

      setDescription(`If you still can't find any recovery emails, you can reinitiate the recovery process in an hour.`);
    }
  }

  function handleRequestSuspended(errResData: unknown): void {
    if (typeof errResData !== 'object' || errResData === null) {
      return;
    }

    if (!('expiryTimestamp' in errResData)) {
      return;
    }

    if (typeof errResData.expiryTimestamp !== 'number' || !Number.isInteger(errResData.expiryTimestamp)) {
      return;
    }

    setDescription(`Recovery request suspended until ${getDateAndTimeString(errResData.expiryTimestamp)}.`);
  }

  return (
    <>
      <h4 className='text-title font-medium mb-1'>{title}</h4>
      <p className='text-description text-sm mb-2'>{description}</p>
      <Button
        className='bg-description border-description text-dark w-full'
        disabled={btnDisabled}
        onClick={async () => {
          if (btnNavigateLocation) {
            navigate(btnNavigateLocation);
            return;
          }

          displayLoadingOverlay();
          setBtnDisabled(true);

          await resendAccountRecoveryEmail();

          setBtnDisabled(false);
          removeLoadingOverlay();
        }}
      >
        {btnTitle}
      </Button>
    </>
  );
}
