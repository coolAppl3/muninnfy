import { ChangeEvent, FormEvent, JSX, useState } from 'react';
import useAuth from '../../../hooks/useAuth';
import useHandleAsyncError, { HandleAsyncErrorFunction } from '../../../hooks/useHandleAsyncError';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import useLoadingOverlay from '../../../hooks/useLoadingOverlay';
import usePopupMessage from '../../../hooks/usePopupMessage';
import { validateEmail } from '../../../utils/validation/userValidation';
import { continueAccountVerificationService } from '../../../services/accountServices';
import DefaultFormGroup from '../../../components/DefaultFormGroup/DefaultFormGroup';
import Button from '../../../components/Button/Button';

export default function ContinueAccountVerificationForm(): JSX.Element {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [emailValue, setEmailValue] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { setAuthStatus } = useAuth();
  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();
  const navigate: NavigateFunction = useNavigate();
  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();
  const { displayPopupMessage } = usePopupMessage();

  async function continueAccountVerification(): Promise<void> {
    const email: string = emailValue;

    try {
      const publicAccountId: string = (await continueAccountVerificationService({ email })).data.publicAccountId;
      navigate(`/sign-up/verification?publicAccountId=${publicAccountId}`);

      displayPopupMessage('Verification request found.', 'success');
    } catch (err: unknown) {
      console.log(err);
      const { isHandled, status, errMessage, errReason } = handleAsyncError(err);

      if (isHandled) {
        return;
      }

      if (status === 403) {
        setAuthStatus('authenticated');
        return;
      }

      if (errReason && [400, 404].includes(status)) {
        setErrorMessage(errMessage);
      }
    }
  }

  return (
    <>
      <h1 className='text-title text-xl 3xs:text-2xl font-bold mb-1'>Account verification</h1>

      <p className='text-description text-sm mb-1'>Enter the email address you used for signing up below.</p>
      <p className='text-description text-sm mb-2'>Unverified accounts are automatically deleted after 20 minutes.</p>

      <form
        onSubmit={async (e: FormEvent) => {
          e.preventDefault();

          if (isSubmitting) {
            return;
          }

          const newErrorMessage: string | null = validateEmail(emailValue);
          if (newErrorMessage) {
            setErrorMessage(newErrorMessage);
            displayPopupMessage(newErrorMessage, 'error');

            return;
          }

          setIsSubmitting(true);
          displayLoadingOverlay();

          await continueAccountVerification();

          removeLoadingOverlay();
          setIsSubmitting(false);
        }}
      >
        <DefaultFormGroup
          id='email'
          label='Email address'
          value={emailValue}
          autoComplete='email'
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const newValue: string = e.target.value;

            setEmailValue(newValue);
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
