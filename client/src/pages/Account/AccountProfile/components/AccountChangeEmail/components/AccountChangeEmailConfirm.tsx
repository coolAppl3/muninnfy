import { ChangeEvent, FormEvent, JSX, useState } from 'react';
import DefaultFormGroup from '../../../../../../components/DefaultFormGroup/DefaultFormGroup';
import Button from '../../../../../../components/Button/Button';
import useAccountProfile from '../../../../hooks/useAccountProfile';
import useLoadingOverlay from '../../../../../../hooks/useLoadingOverlay';
import usePopupMessage from '../../../../../../hooks/usePopupMessage';
import useAuth from '../../../../../../hooks/useAuth';
import useHandleAsyncError, { HandleAsyncErrorFunction } from '../../../../../../hooks/useHandleAsyncError';
import useAccountDetails from '../../../../hooks/useAccountDetails';
import useAccountOngoingRequests from '../../../../hooks/useAccountOngoingRequests';
import { validateHexCode } from '../../../../../../utils/validation/sharedValidation';
import { confirmEmailUpdateService, resendEmailUpdateEmailService } from '../../../../../../services/accountServices';
import { resDataContainsExpiryTimestamp } from '../../../util/AccountProfileUtils';

export default function AccountChangeEmailConfirm(): JSX.Element {
  const { setAccountDetails } = useAccountDetails();
  const { ongoingEmailUpdateRequest, setOngoingEmailUpdateRequest } = useAccountOngoingRequests();
  const { setProfileSection, setIsSubmitting, isSubmitting } = useAccountProfile();

  const [value, setValue] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [resendEmailBtnDisabled, setResendEmailBtnDisabled] = useState<boolean>(false);

  const { setAuthStatus } = useAuth();
  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();
  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();
  const { displayPopupMessage } = usePopupMessage();

  async function confirmEmailUpdate(): Promise<void> {
    if (!ongoingEmailUpdateRequest) {
      displayPopupMessage('Email change request not found or has expired.', 'error');
      return;
    }

    if (ongoingEmailUpdateRequest?.is_suspended) {
      displayPopupMessage('Email update request suspended.', 'error');
      return;
    }
    const confirmationCode: string = value;

    try {
      await confirmEmailUpdateService({ confirmationCode });

      setAccountDetails((prev) => ({ ...prev, email: ongoingEmailUpdateRequest.new_email }));
      setOngoingEmailUpdateRequest(null);

      setProfileSection(null);
      displayPopupMessage('Email changed.', 'success');
    } catch (err: unknown) {
      console.log(err);
      const { isHandled, status, errMessage, errReason, errResData } = handleAsyncError(err);

      if (isHandled) {
        return;
      }

      if (status === 400 && errReason === 'invalidCode') {
        setErrorMessage(errMessage);
        return;
      }

      if (status === 404) {
        if (errReason === 'requestNotFound') {
          setOngoingEmailUpdateRequest(null);
          setProfileSection(null);

          return;
        }

        setAuthStatus('unauthenticated');
        return;
      }

      if (status === 401) {
        setErrorMessage(errMessage);
      }

      if (errReason === 'incorrectCode') {
        return;
      }

      if (!resDataContainsExpiryTimestamp(errResData)) {
        displayPopupMessage('Something went wrong.', 'error');
        return;
      }

      if (errReason === 'requestSuspended' || errReason === 'incorrectCode_suspended') {
        setOngoingEmailUpdateRequest((prev) => prev && { ...prev, expiry_timestamp: errResData.expiryTimestamp, is_suspended: true });
      }
    }
  }

  async function resendEmailUpdateEmail(): Promise<void> {
    if (ongoingEmailUpdateRequest?.is_suspended) {
      displayPopupMessage('Email update request suspended.', 'error');
      return;
    }

    try {
      await resendEmailUpdateEmailService();
      displayPopupMessage('Email resent.', 'success');
    } catch (err: unknown) {
      console.log(err);
      const { isHandled, status, errReason, errResData } = handleAsyncError(err);

      if (isHandled) {
        return;
      }

      if (status === 404) {
        if (errReason === 'requestNotFound') {
          setOngoingEmailUpdateRequest(null);
          setProfileSection(null);

          return;
        }

        setAuthStatus('unauthenticated');
        return;
      }

      if (status !== 403) {
        return;
      }

      if (errReason === 'emailsSentLimitReached') {
        return;
      }

      if (!resDataContainsExpiryTimestamp(errResData)) {
        displayPopupMessage('Something went wrong.', 'error');
        return;
      }

      setOngoingEmailUpdateRequest((prev) => prev && { ...prev, expiry_timestamp: errResData.expiryTimestamp, is_suspended: true });
    }
  }

  return (
    <>
      <header className='mb-1'>
        <p className='text-description font-medium text-sm break-words'>
          Confirmation email sent to <span className='text-title'>{ongoingEmailUpdateRequest?.new_email}</span>.
        </p>

        <button
          type='button'
          className='link text-sm disabled:brightness-50 disabled:cursor-default'
          disabled={resendEmailBtnDisabled}
          onClick={async () => {
            if (isSubmitting) {
              return;
            }

            setResendEmailBtnDisabled(true);
            await resendEmailUpdateEmail();

            setTimeout(() => setResendEmailBtnDisabled(false), 3000);
          }}
        >
          Resend email
        </button>
      </header>

      <form
        className='grid gap-2'
        onSubmit={async (e: FormEvent) => {
          e.preventDefault();

          if (isSubmitting) {
            return;
          }

          const newErrorMessage: string | null = validateHexCode(value);
          if (newErrorMessage) {
            setErrorMessage(newErrorMessage);
            displayPopupMessage(newErrorMessage, 'error');

            return;
          }

          setIsSubmitting(true);
          displayLoadingOverlay();

          await confirmEmailUpdate();

          setIsSubmitting(false);
          removeLoadingOverlay();
        }}
      >
        <DefaultFormGroup
          id='confirmation-code'
          label='Confirmation code'
          autoComplete='off'
          value={value}
          errorMessage={errorMessage}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const newValue: string = e.target.value.trim().toUpperCase().slice(0, 8);

            setValue(newValue);
            setErrorMessage(validateHexCode(newValue));
          }}
        />

        <div className='flex flex-col justify-start items-center gap-1 sm:flex-row'>
          <Button
            isSubmitBtn
            className='bg-cta border-cta order-1 sm:order-2 w-full sm:w-fit'
          >
            Submit
          </Button>

          <Button
            className='bg-secondary border-title text-title order-2 sm:order-1 w-full sm:w-fit'
            onClick={() => setProfileSection(null)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </>
  );
}
