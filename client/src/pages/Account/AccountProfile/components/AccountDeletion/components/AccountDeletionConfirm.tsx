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
import { confirmAccountDeletionService, resendAccountDeletionEmailService } from '../../../../../../services/accountServices';
import { resDataContainsExpiryTimestamp } from '../../../util/AccountProfileUtils';

export default function AccountDeletionConfirm(): JSX.Element {
  const { accountDetails } = useAccountDetails();
  const { ongoingAccountDeletionRequest, setOngoingAccountDeletionRequest } = useAccountOngoingRequests();
  const { setProfileSection, setIsSubmitting, isSubmitting } = useAccountProfile();

  const [value, setValue] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [resendEmailBtnDisabled, setResendEmailBtnDisabled] = useState<boolean>(false);

  const { setAuthStatus } = useAuth();
  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();
  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();
  const { displayPopupMessage } = usePopupMessage();

  async function confirmAccountDeletion(): Promise<void> {
    if (ongoingAccountDeletionRequest?.is_suspended) {
      displayPopupMessage('Email update request suspended.', 'error');
      return;
    }

    const confirmationCode: string = value;

    try {
      await confirmAccountDeletionService(confirmationCode);
      setAuthStatus('unauthenticated');

      displayPopupMessage('Account deleted.', 'success');
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
        setOngoingAccountDeletionRequest(null);
        setProfileSection(null);
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
        setOngoingAccountDeletionRequest({ expiry_timestamp: errResData.expiryTimestamp, is_suspended: true });
      }
    }
  }

  async function resendAccountDeletionEmail(): Promise<void> {
    if (ongoingAccountDeletionRequest?.is_suspended) {
      displayPopupMessage('Email update request suspended.', 'error');
      return;
    }

    try {
      await resendAccountDeletionEmailService();
      displayPopupMessage('Email resent.', 'success');
    } catch (err: unknown) {
      console.log(err);
      const { isHandled, status, errMessage, errReason, errResData } = handleAsyncError(err);

      if (isHandled) {
        return;
      }

      if (status === 404) {
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

      setOngoingAccountDeletionRequest({ expiry_timestamp: errResData.expiryTimestamp, is_suspended: true });
    }
  }

  return (
    <>
      <header className='mb-1'>
        <p className='text-description font-medium text-sm break-words'>
          Confirmation email sent to <span className='text-title'>{accountDetails?.email}</span>.
        </p>

        <button
          type='button'
          className='link text-sm disabled:brightness-50 disabled:cursor-default mb-1'
          disabled={resendEmailBtnDisabled}
          onClick={async () => {
            if (isSubmitting) {
              return;
            }

            setResendEmailBtnDisabled(true);
            await resendAccountDeletionEmail();

            setTimeout(() => setResendEmailBtnDisabled(false), 3000);
          }}
        >
          Resend email
        </button>

        <p className='bg-dark rounded p-1 text-danger font-medium text-sm break-words'>
          This action is irreversible and will permanently delete your account! Please proceed with caution!
        </p>
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

          await confirmAccountDeletion();

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
            className='bg-danger border-danger order-1 sm:order-2 w-full sm:w-fit'
          >
            Delete account
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
