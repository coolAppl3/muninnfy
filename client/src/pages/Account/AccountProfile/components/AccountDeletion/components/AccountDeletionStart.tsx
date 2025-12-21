import { ChangeEvent, FormEvent, JSX, useState } from 'react';
import { validatePassword } from '../../../../../../utils/validation/userValidation';
import Button from '../../../../../../components/Button/Button';
import useAccountProfile from '../../../../hooks/useAccountProfile';
import useLoadingOverlay from '../../../../../../hooks/useLoadingOverlay';
import usePopupMessage from '../../../../../../hooks/usePopupMessage';
import useAuth from '../../../../../../hooks/useAuth';
import useHandleAsyncError, { HandleAsyncErrorFunction } from '../../../../../../hooks/useHandleAsyncError';
import PasswordFormGroup from '../../../../../../components/PasswordFormGroup/PasswordFormGroup';
import { startAccountDeletionService } from '../../../../../../services/accountServices';
import useAccountOngoingRequests from '../../../../hooks/useAccountOngoingRequests';
import { isValidOngoingRequestData } from '../../../util/AccountProfileUtils';

export default function AccountDeletionStart(): JSX.Element {
  const { setOngoingAccountDeletionRequest } = useAccountOngoingRequests();
  const { setProfileSection, setIsSubmitting, isSubmitting } = useAccountProfile();

  const [value, setValue] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { setAuthStatus } = useAuth();
  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();
  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();
  const { displayPopupMessage } = usePopupMessage();

  async function startAccountDeletion(): Promise<void> {
    const password: string = value;

    try {
      const expiryTimestamp: number = await (await startAccountDeletionService({ password })).data.expiryTimestamp;
      setOngoingAccountDeletionRequest({ expiry_timestamp: expiryTimestamp, is_suspended: false });

      displayPopupMessage('Confirmation email sent.', 'success');
    } catch (err: unknown) {
      console.log(err);
      const { isHandled, status, errMessage, errReason, errResData } = handleAsyncError(err);

      if (isHandled) {
        return;
      }

      if (status === 400 && errReason === 'invalidPassword') {
        setErrorMessage(errMessage);
        return;
      }

      if (status === 401) {
        setErrorMessage(errMessage);
        errReason === 'incorrectPassword_locked' && setAuthStatus('unauthenticated');

        return;
      }

      if (status === 404) {
        setAuthStatus('unauthenticated');
        return;
      }

      if (status !== 409) {
        return;
      }

      if (!isValidOngoingRequestData(errResData)) {
        displayPopupMessage('Something went wrong.', 'error');
        return;
      }

      setOngoingAccountDeletionRequest(errResData);
    }
  }

  return (
    <>
      <h4 className='text-danger font-medium mb-1'>Account deletion</h4>

      <form
        className='grid gap-2'
        onSubmit={async (e: FormEvent) => {
          e.preventDefault();

          if (isSubmitting) {
            return;
          }

          const newErrorMessage: string | null = validatePassword(value);
          if (newErrorMessage) {
            setErrorMessage(newErrorMessage);
            displayPopupMessage(newErrorMessage, 'error');

            return;
          }

          setIsSubmitting(true);
          displayLoadingOverlay();

          await startAccountDeletion();

          setIsSubmitting(false);
          removeLoadingOverlay();
        }}
      >
        <PasswordFormGroup
          id='password'
          label='Password'
          value={value}
          errorMessage={errorMessage}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const newValue: string = e.target.value;

            setValue(newValue);
            setErrorMessage(validatePassword(newValue));
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
