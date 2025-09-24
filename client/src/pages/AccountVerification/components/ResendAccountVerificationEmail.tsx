import { JSX, useState } from 'react';
import useAuth from '../../../hooks/useAuth';
import useAsyncErrorHandler, { HandleAsyncErrorFunction } from '../../../hooks/useAsyncErrorHandler';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import useLoadingOverlay from '../../../hooks/useLoadingOverlay';
import usePopupMessage from '../../../hooks/usePopupMessage';
import Button from '../../../components/Button/Button';
import { resendAccountVerificationEmailService } from '../../../services/accountServices';

export default function ResendAccountVerificationEmail({ publicAccountId }: { publicAccountId: string }): JSX.Element {
  const [title, setTitle] = useState<string>('Ongoing account verification detected.');
  const [description, setDescription] = useState<string>('Find the verification email in your inbox, and click the link to continue.');

  const [btnDisabled, setBtnDisabled] = useState<boolean>(false);
  const [btnTitle, setBtnTitle] = useState<string>('Resend email');
  const [btnNavigateLocation, setBtnNavigateLocation] = useState<string | null>(null);

  const { setAuthStatus } = useAuth();
  const handleAsyncError: HandleAsyncErrorFunction = useAsyncErrorHandler();
  const navigate: NavigateFunction = useNavigate();
  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();
  const { displayPopupMessage } = usePopupMessage();

  async function resendAccountVerificationEmail(): Promise<void> {
    displayLoadingOverlay();
    setBtnDisabled(true);

    try {
      await resendAccountVerificationEmailService({ publicAccountId });
      displayPopupMessage('Email resent.', 'success');
    } catch (err: unknown) {
      console.log(err);
      const { isHandled, status, errMessage, errReason } = handleAsyncError(err);

      if (isHandled) {
        return;
      }

      if (status === 403 && errReason === 'signedIn') {
        setAuthStatus('authenticated');
        return;
      }

      setTitle(errMessage);

      if (status === 400 || (status === 403 && errReason === 'emailLimitReached')) {
        setBtnTitle('Go to homepage');
        setBtnNavigateLocation('/home');

        setDescription(
          status === 400
            ? 'Check your inbox for a verification email, or start the sign up process again.'
            : `If you still can't find the email, wait 20 minutes and start again.`
        );

        return;
      }

      if (status === 404) {
        setBtnTitle('Sign up again');
        setBtnNavigateLocation('/sign-up');

        setDescription('Accounts are deleted within 20 minutes of being created if left unverified.');
        return;
      }

      if (status === 409) {
        setBtnTitle('Sign in');
        setBtnNavigateLocation('/sign-in');

        setDescription('You may simply proceed with signing in.');
      }
    } finally {
      removeLoadingOverlay();
      setBtnDisabled(false);
    }
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

          await resendAccountVerificationEmail();
        }}
      >
        {btnTitle}
      </Button>
    </>
  );
}
