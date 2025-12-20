import { ChangeEvent, FormEvent, JSX, useState } from 'react';
import DefaultFormGroup from '../../../../../../components/DefaultFormGroup/DefaultFormGroup';
import { validateEmail, validatePassword } from '../../../../../../utils/validation/userValidation';
import Button from '../../../../../../components/Button/Button';
import useAccountProfile from '../../../../hooks/useAccountProfile';
import useLoadingOverlay from '../../../../../../hooks/useLoadingOverlay';
import usePopupMessage from '../../../../../../hooks/usePopupMessage';
import useAuth from '../../../../../../hooks/useAuth';
import useHandleAsyncError, { HandleAsyncErrorFunction } from '../../../../../../hooks/useHandleAsyncError';
import PasswordFormGroup from '../../../../../../components/PasswordFormGroup/PasswordFormGroup';
import useAccountDetails from '../../../../hooks/useAccountDetails';
import { startEmailUpdateService } from '../../../../../../services/accountServices';
import useAccountOngoingRequests from '../../../../hooks/useAccountOngoingRequests';
import { OngoingAccountRequest } from '../../../../../../types/accountTypes';
import { isValidOngoingRequestData } from '../../../util/AccountProfileUtils';

export default function AccountChangeEmailStart(): JSX.Element {
  const { accountDetails } = useAccountDetails();
  const { setOngoingEmailUpdateRequest } = useAccountOngoingRequests();
  const { setProfileSection, setIsSubmitting, isSubmitting } = useAccountProfile();

  const [emailValue, setEmailValue] = useState<string>('');
  const [emailErrorMessage, setEmailErrorMessage] = useState<string | null>(null);

  const [passwordValue, setPasswordValue] = useState<string>('');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState<string | null>(null);

  const { setAuthStatus } = useAuth();
  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();
  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();
  const { displayPopupMessage } = usePopupMessage();

  async function startEmailUpdate(): Promise<void> {
    const newEmail: string = emailValue;
    const password: string = passwordValue;

    try {
      const expiryTimestamp: number = (await startEmailUpdateService({ newEmail, password })).data.expiryTimestamp;
      setOngoingEmailUpdateRequest({ new_email: newEmail, expiry_timestamp: expiryTimestamp, is_suspended: false });

      displayPopupMessage('Confirmation email sent.', 'success');
    } catch (err: unknown) {
      console.log(err);
      const { isHandled, status, errMessage, errReason, errResData } = handleAsyncError(err);

      if (isHandled) {
        return;
      }

      if (status === 400 && errReason) {
        errReason === 'invalidEmail' ? setEmailErrorMessage(errMessage) : setPasswordErrorMessage(errMessage);
        return;
      }

      if (status === 401) {
        setPasswordErrorMessage(errMessage);
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

      if (errReason !== 'ongoingRequest') {
        setEmailErrorMessage(errMessage);
        return;
      }

      if (!isValidOngoingEmailUpdateRequest(errResData)) {
        displayPopupMessage('Something went wrong.', 'error');
        return;
      }

      setOngoingEmailUpdateRequest(errResData);
    }
  }

  function allFieldsValid(): boolean {
    const newEmailErrorMessage: string | null =
      accountDetails.email === emailValue ? 'Email already linked to this account.' : validateEmail(emailValue);
    const newPasswordErrorMessage: string | null = validatePassword(passwordValue);

    setEmailErrorMessage(newEmailErrorMessage);
    setPasswordErrorMessage(newPasswordErrorMessage);

    for (const errorMessage of [newEmailErrorMessage, newPasswordErrorMessage]) {
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

        if (isSubmitting || !allFieldsValid()) {
          return;
        }

        setIsSubmitting(true);
        displayLoadingOverlay();

        await startEmailUpdate();

        setIsSubmitting(false);
        removeLoadingOverlay();
      }}
    >
      <DefaultFormGroup
        id='new-email'
        label='New email'
        autoComplete='email'
        value={emailValue}
        errorMessage={emailErrorMessage}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const newValue: string = e.target.value;

          setEmailValue(newValue);
          setEmailErrorMessage(newValue === accountDetails.email ? 'Email already linked to this account.' : validateEmail(newValue));
        }}
      />

      <PasswordFormGroup
        id='password'
        label='Password'
        value={passwordValue}
        errorMessage={passwordErrorMessage}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const newValue: string = e.target.value;

          setPasswordValue(newValue);
          setPasswordErrorMessage(validatePassword(newValue));
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

function isValidOngoingEmailUpdateRequest(errResData: unknown): errResData is OngoingAccountRequest & { new_email: string } {
  if (!isValidOngoingRequestData(errResData)) {
    return false;
  }

  if (!('new_email' in errResData) || typeof errResData.new_email !== 'string') {
    return false;
  }

  return true;
}
