import { ChangeEvent, Dispatch, FormEvent, JSX, SetStateAction, useState } from 'react';
import Button from '../../../components/Button/Button';
import PasswordFormGroup from '../../../components/PasswordFormGroup/PasswordFormGroup';
import useLoadingOverlay from '../../../hooks/useLoadingOverlay';
import usePopupMessage from '../../../hooks/usePopupMessage';
import { validateNewPassword } from '../../../utils/validation/userValidation';
import useHandleAsyncError, { HandleAsyncErrorFunction } from '../../../hooks/useHandleAsyncError';
import { confirmAccountRecoveryService } from '../../../services/accountServices';
import { getDateAndTimeString } from '../../../utils/globalUtils';
import useAuth from '../../../hooks/useAuth';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import InstructionCard from '../../../components/InstructionCard/InstructionCard';

type ConfirmAccountRecoveryProps = {
  publicAccountId: string;
  recoveryToken: string;

  setIsValidRecoveryLink: Dispatch<SetStateAction<boolean>>;
};

export default function ConfirmAccountRecovery({
  publicAccountId,
  recoveryToken,
  setIsValidRecoveryLink,
}: ConfirmAccountRecoveryProps): JSX.Element {
  const [renderMode, setRenderMode] = useState<'form' | 'incorrectToken' | 'requestSuspended'>('form');
  const [suspensionRecoveryTimestamp, setSuspensionRecoveryTimestamp] = useState<number | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [passwordErrorMessage, setPasswordErrorMessage] = useState<string | null>(null);
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = useState<string | null>(null);

  const { setAuthStatus } = useAuth();
  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();
  const navigate: NavigateFunction = useNavigate();
  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();
  const { displayPopupMessage } = usePopupMessage();

  async function confirmAccountRecovery(): Promise<void> {
    const newPassword: string = password;

    try {
      const authSessionCreated: boolean = (await confirmAccountRecoveryService({ publicAccountId, recoveryToken, newPassword })).data
        .authSessionCreated;

      displayPopupMessage('Recovery successful.', 'success');

      if (!authSessionCreated) {
        navigate('/sign-in');
        return;
      }

      setAuthStatus('authenticated');
      navigate('/account');
    } catch (err: unknown) {
      console.log(err);
      const { isHandled, status, errMessage, errReason, errResData } = handleAsyncError(err);

      if (isHandled) {
        return;
      }

      if (status === 401) {
        errReason === 'incorrectToken_suspended' ? handleRequestSuspended(errResData) : setRenderMode('incorrectToken');
        return;
      }

      if (status === 404 || status === 409) {
        setPasswordErrorMessage(errMessage);
        return;
      }

      if (status === 403) {
        if (errReason === 'signedIn') {
          setAuthStatus('unauthenticated');
          return;
        }

        handleRequestSuspended(errResData);
        return;
      }

      if (status !== 400) {
        return;
      }

      if (!errReason) {
        displayPopupMessage('Something went wrong.', 'error');
        return;
      }

      if (errReason === 'invalidNewPassword') {
        setPasswordErrorMessage(errMessage);
        return;
      }

      setIsValidRecoveryLink(false);
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

    setSuspensionRecoveryTimestamp(errResData.expiryTimestamp);
    setRenderMode('requestSuspended');
  }

  function allFieldsValid(): boolean {
    const newPasswordErrorMessage: string | null = validateNewPassword(password);
    const newConfirmPasswordErrorMessage: string | null = password === confirmPassword ? null : `Passwords don't match.`;

    setPasswordErrorMessage(newPasswordErrorMessage);
    setConfirmPasswordErrorMessage(newConfirmPasswordErrorMessage);

    for (const errorMessage of [newPasswordErrorMessage, newConfirmPasswordErrorMessage]) {
      if (errorMessage) {
        displayPopupMessage(errorMessage, 'error');
        return false;
      }
    }

    return true;
  }

  if (renderMode === 'incorrectToken') {
    return (
      <InstructionCard
        title='Incorrect recovery token.'
        description={`Please make sure you use the full recovery link we've sent you.`}
        btnTitle='Go to homepage'
        btnDisabled={false}
        onClick={() => navigate('/home')}
      />
    );
  }

  if (renderMode === 'requestSuspended') {
    return (
      <InstructionCard
        title='Recovery suspended.'
        description={`Too many failed attempts were made. You can try again after ${suspensionRecoveryTimestamp ? getDateAndTimeString(suspensionRecoveryTimestamp) : '24 hours'}.`}
        btnTitle='Go to homepage'
        btnDisabled={false}
        onClick={() => navigate('/home')}
      />
    );
  }

  return (
    <>
      <h1 className='text-title text-xl 3xs:text-2xl font-bold mb-1'>Update your details</h1>
      <p className='text-description text-sm mb-[1.6rem]'>Set your account's new password before proceeding.</p>

      <form
        id='sign-up-form'
        className='grid grid-cols-1 gap-2 mb-2'
        onSubmit={async (e: FormEvent) => {
          e.preventDefault();

          if (isSubmitting || !allFieldsValid()) {
            return;
          }

          setIsSubmitting(true);
          displayLoadingOverlay();

          await confirmAccountRecovery();

          setIsSubmitting(false);
          removeLoadingOverlay();
        }}
      >
        <PasswordFormGroup
          id='new-password'
          label='New password'
          value={password}
          errorMessage={passwordErrorMessage}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const newValue: string = e.target.value;

            setPassword(newValue);
            setPasswordErrorMessage(validateNewPassword(newValue));

            setConfirmPasswordErrorMessage(newValue === confirmPassword ? null : `Passwords don't match.`);
          }}
        />

        <PasswordFormGroup
          id='confirm-new-password'
          label='Confirm new password'
          value={confirmPassword}
          errorMessage={confirmPasswordErrorMessage}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const newValue: string = e.target.value;

            setConfirmPassword(newValue);
            setConfirmPasswordErrorMessage(newValue === password ? null : `Passwords don't match.`);
          }}
        />

        <Button
          className='bg-cta border-cta w-full'
          isSubmitBtn
        >
          Submit
        </Button>
      </form>
    </>
  );
}
