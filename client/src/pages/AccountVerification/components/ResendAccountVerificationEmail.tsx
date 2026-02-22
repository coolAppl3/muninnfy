import { Dispatch, JSX, SetStateAction, useState } from 'react';
import useAuth from '../../../hooks/useAuth';
import useHandleAsyncError, { HandleAsyncErrorFunction } from '../../../hooks/useHandleAsyncError';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import useLoadingOverlay from '../../../hooks/useLoadingOverlay';
import usePopupMessage from '../../../hooks/usePopupMessage';
import { resendAccountVerificationEmailService } from '../../../services/accountServices';
import InstructionCard from '../../../components/InstructionCard/InstructionCard';

type ResendAccountVerificationEmailProps = {
  publicAccountId: string;
  setIsValidVerificationLink: Dispatch<SetStateAction<boolean>>;
};

export default function ResendAccountVerificationEmail({
  publicAccountId,
  setIsValidVerificationLink,
}: ResendAccountVerificationEmailProps): JSX.Element {
  const [title, setTitle] = useState<string>('Account verification in progress.');
  const [description, setDescription] = useState<string>('Check your inbox for a verification email and click the link to continue.');

  const [btnDisabled, setBtnDisabled] = useState<boolean>(false);
  const [btnTitle, setBtnTitle] = useState<string>('Resend email');
  const [btnNavigateLocation, setBtnNavigateLocation] = useState<string | null>(null);

  const { setAuthStatus } = useAuth();
  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();
  const navigate: NavigateFunction = useNavigate();
  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();
  const { displayPopupMessage } = usePopupMessage();

  async function resendAccountVerificationEmail(): Promise<void> {
    try {
      await resendAccountVerificationEmailService({ publicAccountId });
      displayPopupMessage('Email resent.', 'success');
    } catch (err: unknown) {
      console.log(err);
      const { isHandled, status, errMessage, errReason } = handleAsyncError(err);

      if (isHandled) {
        return;
      }

      if (status === 400) {
        displayPopupMessage('Invalid recovery link.', 'error');
        setIsValidVerificationLink(false);

        return;
      }

      setTitle(errMessage);

      if (status === 404) {
        setDescription(`Account either doesn't exist or has had its verification window expire.`);
        setBtnTitle('Sign up');
        setBtnNavigateLocation('/sign-up');

        return;
      }

      if (status === 409) {
        setDescription('You may proceed with signing in.');
        setBtnTitle('Sign in');
        setBtnNavigateLocation('/sign-in');

        return;
      }

      if (status !== 403) {
        return;
      }

      if (errReason === 'signedIn') {
        setAuthStatus('authenticated');
        return;
      }

      setDescription(`If you still can't find the email, you can try signing up again after 20 minutes.`);
      setBtnTitle('Go to homepage');
      setBtnNavigateLocation('/home');
    }
  }

  return (
    <InstructionCard
      title={title}
      description={description}
      btnTitle={btnTitle}
      btnDisabled={btnDisabled}
      onClick={async () => {
        if (btnNavigateLocation) {
          navigate(btnNavigateLocation);
          return;
        }

        displayLoadingOverlay();
        setBtnDisabled(true);

        await resendAccountVerificationEmail();

        setBtnDisabled(false);
        removeLoadingOverlay();
      }}
    />
  );
}
