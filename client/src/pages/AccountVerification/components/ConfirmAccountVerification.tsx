import { Dispatch, JSX, SetStateAction, useCallback, useEffect, useState } from 'react';
import useAuth from '../../../hooks/useAuth';
import useHandleAsyncError, { HandleAsyncErrorFunction } from '../../../hooks/useHandleAsyncError';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import usePopupMessage from '../../../hooks/usePopupMessage';
import { verifyAccountService } from '../../../services/accountServices';
import { CanceledError } from 'axios';
import InstructionCard from '../../../components/InstructionCard/InstructionCard';

type ConfirmAccountVerificationProps = {
  publicAccountId: string;
  verificationToken: string;
  setIsValidVerificationLink: Dispatch<SetStateAction<boolean>>;
};

export default function ConfirmAccountVerification({
  publicAccountId,
  verificationToken,
  setIsValidVerificationLink,
}: ConfirmAccountVerificationProps): JSX.Element {
  const [verificationFailed, setVerificationFailed] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('Ongoing account verification detected.');
  const [description, setDescription] = useState<string>('Check your inbox for the verification email and click the link to continue.');
  const [btnTitle, setBtnTitle] = useState<string>('Resend email');
  const [btnNavigateLocation, setBtnNavigateLocation] = useState<string | null>(null);

  const { setAuthStatus } = useAuth();
  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();
  const navigate: NavigateFunction = useNavigate();
  const { displayPopupMessage } = usePopupMessage();

  const verifyAccount = useCallback(
    async (abortSignal: AbortSignal = new AbortController().signal) => {
      try {
        await verifyAccountService({ publicAccountId, verificationToken }, abortSignal);

        displayPopupMessage('Account verified.', 'success');
        navigate('/sign-in');
      } catch (err: unknown) {
        if (err instanceof CanceledError) {
          return;
        }

        console.log(err);
        const { isHandled, status, errMessage, errReason } = handleAsyncError(err);

        setVerificationFailed(true);

        if (status === 500) {
          displayPopupMessage('Something went wrong.', 'error');

          setTitle('Something went wrong.');
          setDescription('Account verification failed due to an unexpected error.');
          setBtnTitle('Try again');
          setBtnNavigateLocation(null);

          return;
        }

        if (isHandled) {
          return;
        }

        if (status === 400) {
          displayPopupMessage('Invalid recovery link.', 'error');
          setIsValidVerificationLink(false);

          return;
        }

        if (status === 403) {
          setAuthStatus('authenticated');
          return;
        }

        setTitle(errMessage);

        if (status === 401) {
          const accountDeleted: boolean = errReason === 'incorrectVerificationToken_deleted';

          setDescription(
            accountDeleted
              ? 'Account deleted due to too many failed verification attempts. You can start over any time.'
              : `Please make sure you use the full recovery link we've sent you.`
          );

          setBtnTitle('Go to homepage');
          setBtnNavigateLocation('/home');

          return;
        }

        if (status === 409) {
          setDescription('You may proceed with signing in.');
          setBtnTitle('Sign in');
          setBtnNavigateLocation('/sign-in');

          return;
        }

        if (status === 404) {
          setDescription(`Account either doesn't exist or has had its verification window expire.`);
          setBtnTitle('Sign up');
          setBtnNavigateLocation('/sign-up');

          return;
        }
      }
    },
    [publicAccountId, verificationToken, setIsValidVerificationLink, displayPopupMessage, navigate, setAuthStatus, handleAsyncError]
  );

  useEffect(() => {
    const abortController: AbortController = new AbortController();
    verifyAccount(abortController.signal);

    return () => abortController.abort();
  }, [verifyAccount]);

  if (!verificationFailed) {
    return <div className='spinner w-3 h-3 mx-auto block'></div>;
  }

  return (
    <InstructionCard
      title={title}
      description={description}
      btnTitle={btnTitle}
      btnDisabled={false}
      onClick={async () => {
        if (btnNavigateLocation) {
          navigate(btnNavigateLocation);
          return;
        }

        setVerificationFailed(false);
        await verifyAccount();
      }}
    />
  );
}
