import { JSX, useCallback, useEffect, useState } from 'react';
import useAuth from '../../../hooks/useAuth';
import useAsyncErrorHandler, { HandleAsyncErrorFunction } from '../../../hooks/useAsyncErrorHandler';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import usePopupMessage from '../../../hooks/usePopupMessage';
import Button from '../../../components/Button/Button';
import { verifyAccountService } from '../../../services/accountServices';
import { CanceledError } from 'axios';

type ConfirmAccountVerificationProps = {
  publicAccountId: string;
  verificationToken: string;
};

export default function ConfirmAccountVerification({ publicAccountId, verificationToken }: ConfirmAccountVerificationProps): JSX.Element {
  const [verificationFailed, setVerificationFailed] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('Ongoing account verification detected.');
  const [description, setDescription] = useState<string>('Find the verification email in your inbox, and click the link to continue.');
  const [btnTitle, setBtnTitle] = useState<string>('Resend email');
  const [btnNavigateLocation, setBtnNavigateLocation] = useState<string | null>(null);

  const { setAuthStatus } = useAuth();
  const handleAsyncError: HandleAsyncErrorFunction = useAsyncErrorHandler();
  const navigate: NavigateFunction = useNavigate();
  const { displayPopupMessage } = usePopupMessage();

  const verifyAccount = useCallback(
    async (abortSignal: AbortSignal = new AbortController().signal): Promise<void> => {
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

        if (isHandled) {
          return;
        }

        if (status === 500) {
          setVerificationFailed(true);
          displayPopupMessage('Something went wrong.', 'error');

          setTitle('Something went wrong.');
          setDescription('Account verification failed due to an unexpected error.');
          setBtnTitle('Try again');

          return;
        }

        if (status === 403) {
          setAuthStatus('authenticated');
          return;
        }

        setVerificationFailed(true);
        setTitle(errMessage);

        if (status === 401) {
          const accountDeleted: boolean = errReason?.includes('_deleted') === true;
          const description: string = accountDeleted
            ? 'Account deleted due to too many failed verification attempts.'
            : `Your verification link is invalid or malformed. Make sure you've copied the correct link.`;

          setDescription(description);
          setBtnTitle(accountDeleted ? 'Sign up again' : 'Go to homepage');
          setBtnNavigateLocation('/sign-up');

          return;
        }

        if (status === 400) {
          setDescription(`Your verification link is invalid or malformed. Make sure you've copied the correct link.`);
          setBtnTitle('Go to homepage');
          setBtnNavigateLocation('/home');

          return;
        }

        if (status === 404) {
          setDescription(`Account doesn't exist or may have been deleted after remaining unverified for longer than 20 minutes.`);
          setBtnTitle('Sign up');
          setBtnNavigateLocation('/sign-up');

          return;
        }

        if (status === 409) {
          setDescription('You may proceed with signing in.');
          setBtnTitle('Sign in');
          setBtnNavigateLocation('/sign-in');
        }
      }
    },
    [publicAccountId, verificationToken, displayPopupMessage, navigate, setAuthStatus, handleAsyncError]
  );

  useEffect(() => {
    const abortController: AbortController = new AbortController();
    verifyAccount(abortController.signal);

    return () => abortController.abort();
  }, [verifyAccount]);

  return (
    <>
      {verificationFailed ? (
        <>
          <h4 className='text-title font-medium mb-1'>{title}</h4>
          <p className='text-description text-sm'>{description}</p>

          <Button
            className='bg-description border-description text-dark w-full mt-2'
            onClick={async () => {
              if (btnNavigateLocation) {
                navigate(btnNavigateLocation);
                return;
              }

              setVerificationFailed(false);
              await verifyAccount();
              setVerificationFailed(true);
            }}
          >
            {btnTitle}
          </Button>
        </>
      ) : (
        <div className='spinner w-3 h-3 mx-auto block'></div>
      )}
    </>
  );
}
