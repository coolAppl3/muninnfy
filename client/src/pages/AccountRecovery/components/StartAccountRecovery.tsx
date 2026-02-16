import { ChangeEvent, FormEvent, JSX, useState } from 'react';
import { validateEmail } from '../../../utils/validation/userValidation';
import Button from '../../../components/Button/Button';
import DefaultFormGroup from '../../../components/DefaultFormGroup/DefaultFormGroup';
import usePopupMessage from '../../../hooks/usePopupMessage';
import useHandleAsyncError, { HandleAsyncErrorFunction } from '../../../hooks/useHandleAsyncError';
import useAuth from '../../../hooks/useAuth';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { startAccountRecoveryService } from '../../../services/accountServices';
import { getDateAndTimeString } from '../../../utils/globalUtils';
import useLoadingOverlay from '../../../hooks/useLoadingOverlay';

export default function StartAccountRecovery(): JSX.Element {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [value, setValue] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { setAuthStatus } = useAuth();
  const navigate: NavigateFunction = useNavigate();
  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();
  const { displayPopupMessage } = usePopupMessage();
  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();

  async function startAccountRecovery(): Promise<void> {
    const email: string = value;

    try {
      const publicAccountId: string = await (await startAccountRecoveryService({ email })).data.publicAccountId;

      navigate(`/account/recovery?publicAccountId=${publicAccountId}`);
      displayPopupMessage('Recovery email sent.', 'success');
    } catch (err: unknown) {
      console.log(err);
      const { isHandled, status, errMessage, errReason, errResData } = handleAsyncError(err);

      if (isHandled) {
        return;
      }

      if (errReason && [400, 404].includes(status)) {
        setErrorMessage(errMessage);
        return;
      }

      if (status === 409) {
        displayPopupMessage(errMessage, 'success');
        handleOngoingRequestDetected(errResData);

        return;
      }

      if (status !== 403) {
        return;
      }

      if (errReason === 'requestSuspended') {
        handleRequestSuspended(errResData);
        return;
      }

      setAuthStatus('authenticated');
      return;
    }
  }

  function handleOngoingRequestDetected(errResData: unknown): void {
    if (typeof errResData !== 'object' || errResData === null) {
      return;
    }

    if (!('publicAccountId' in errResData) || typeof errResData.publicAccountId !== 'string') {
      return;
    }

    navigate(`/account/recovery?publicAccountId=${errResData.publicAccountId}`);
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

    setErrorMessage(`Recovery request suspended until ${getDateAndTimeString(errResData.expiryTimestamp)}.`);
  }

  return (
    <>
      <h1 className='text-title text-xl 3xs:text-2xl font-bold mb-1'>Account recovery</h1>
      <p className='text-description text-sm mb-[1.6rem]'>Enter your account's email address to start the recovery process.</p>

      <form
        onSubmit={async (e: FormEvent) => {
          e.preventDefault();

          if (isSubmitting) {
            return;
          }

          const newErrorMessage: string | null = validateEmail(value);
          if (newErrorMessage) {
            setErrorMessage(newErrorMessage);
            displayPopupMessage(newErrorMessage, 'error');

            return;
          }

          setIsSubmitting(true);
          displayLoadingOverlay();

          await startAccountRecovery();

          removeLoadingOverlay();
          setIsSubmitting(false);
        }}
      >
        <DefaultFormGroup
          id='email'
          label='Email address'
          value={value}
          autoComplete='email'
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const newValue: string = e.target.value;

            setValue(newValue);
            setErrorMessage(validateEmail(newValue));
          }}
          errorMessage={errorMessage}
        />

        <Button
          isSubmitBtn
          className='bg-cta border-cta w-full mt-2'
        >
          Continue
        </Button>
      </form>
    </>
  );
}
