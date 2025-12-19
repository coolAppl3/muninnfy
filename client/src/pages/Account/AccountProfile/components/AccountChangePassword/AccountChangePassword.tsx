import { ChangeEvent, FormEvent, JSX, useState } from 'react';
import Button from '../../../../../components/Button/Button';
import { validateNewPassword, validatePassword } from '../../../../../utils/validation/userValidation';
import useAccountProfile from '../../../hooks/useAccountProfile';
import useLoadingOverlay from '../../../../../hooks/useLoadingOverlay';
import usePopupMessage from '../../../../../hooks/usePopupMessage';
import useHandleAsyncError, { HandleAsyncErrorFunction } from '../../../../../hooks/useHandleAsyncError';
import useAuth from '../../../../../hooks/useAuth';
import PasswordFormGroup from '../../../../../components/PasswordFormGroup/PasswordFormGroup';
import { updatePasswordService } from '../../../../../services/accountServices';
import useAccountDetails from '../../../hooks/useAccountDetails';

export default function AccountChangePassword(): JSX.Element {
  const { accountDetails } = useAccountDetails();
  const { setProfileSection, setIsSubmitting, isSubmitting } = useAccountProfile();

  const [currentPasswordValue, setCurrentPasswordValue] = useState<string>('');
  const [currentPasswordErrorMessage, setCurrentPasswordErrorMessage] = useState<string | null>(null);

  const [newPasswordValue, setNewPasswordValue] = useState<string>('');
  const [newPasswordErrorMessage, setNewPasswordErrorMessage] = useState<string | null>(null);

  const [confirmNewPasswordValue, setConfirmNewPasswordValue] = useState<string>('');
  const [confirmNewPasswordErrorMessage, setConfirmNewPasswordErrorMessage] = useState<string | null>(null);

  const { setAuthStatus } = useAuth();
  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();
  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();
  const { displayPopupMessage } = usePopupMessage();

  async function updateDisplayName(): Promise<void> {
    const password: string = currentPasswordValue;
    const newPassword: string = newPasswordValue;

    try {
      await updatePasswordService({ password, newPassword });

      displayPopupMessage('Password changed.', 'success');
      setProfileSection(null);
    } catch (err: unknown) {
      console.log(err);
      const { isHandled, status, errMessage, errReason } = handleAsyncError(err);

      if (isHandled) {
        return;
      }

      if (status === 400 && errReason) {
        errReason === 'invalidCurrentPassword' ? setCurrentPasswordErrorMessage(errMessage) : setNewPasswordErrorMessage(errMessage);
        return;
      }

      if (status === 401) {
        setCurrentPasswordErrorMessage(errMessage);
        errMessage === 'incorrectPassword_locked' && setAuthStatus('unauthenticated');

        return;
      }

      if (status === 409) {
        setNewPasswordErrorMessage(errMessage);
        return;
      }

      if (status === 404) {
        setAuthStatus('unauthenticated');
      }
    }
  }

  function allFieldsValid(): boolean {
    const newCurrentPasswordErrorMessage: string | null = validatePassword(currentPasswordValue);

    const newNewPasswordErrorMessage: string | null =
      newPasswordValue === accountDetails.username ? `Username and password can't match.` : validateNewPassword(newPasswordValue);
    const newConfirmNewPasswordErrorMessage: string | null = confirmNewPasswordValue === newPasswordValue ? null : `Passwords don't match.`;

    setCurrentPasswordErrorMessage(newCurrentPasswordErrorMessage);
    setNewPasswordErrorMessage(newNewPasswordErrorMessage);
    setConfirmNewPasswordErrorMessage(newConfirmNewPasswordErrorMessage);

    for (const errorMessage of [newCurrentPasswordErrorMessage, newNewPasswordErrorMessage, newConfirmNewPasswordErrorMessage]) {
      if (errorMessage) {
        displayPopupMessage(errorMessage, 'error');
        return false;
      }
    }

    return true;
  }

  return (
    <form
      className='grid gap-2'
      onSubmit={async (e: FormEvent) => {
        e.preventDefault();

        if (isSubmitting) {
          return;
        }

        if (!allFieldsValid()) {
          return;
        }

        setIsSubmitting(true);
        displayLoadingOverlay();

        await updateDisplayName();

        setIsSubmitting(false);
        removeLoadingOverlay();
      }}
    >
      <PasswordFormGroup
        id='current-password'
        label='Current password'
        value={currentPasswordValue}
        errorMessage={currentPasswordErrorMessage}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const newValue: string = e.target.value;

          setCurrentPasswordValue(newValue);
          setCurrentPasswordErrorMessage(validatePassword(newValue));
        }}
      />

      <PasswordFormGroup
        id='new-password'
        label='New password'
        value={newPasswordValue}
        errorMessage={newPasswordErrorMessage}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const newValue: string = e.target.value;

          setNewPasswordValue(newValue);
          setNewPasswordErrorMessage(
            newValue === accountDetails.username ? `Username and password can't match.` : validateNewPassword(newValue)
          );
        }}
      />

      <PasswordFormGroup
        id='confirm-new-password'
        label='Confirm new password'
        value={confirmNewPasswordValue}
        errorMessage={confirmNewPasswordErrorMessage}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const newValue: string = e.target.value;

          setConfirmNewPasswordValue(newValue);
          setConfirmNewPasswordErrorMessage(newValue === newPasswordValue ? null : `Passwords don't match`);
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
  );
}
