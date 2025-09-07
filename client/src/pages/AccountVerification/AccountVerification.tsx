import { ChangeEvent, FormEvent, JSX, useCallback, useEffect, useState } from 'react';
import { Head } from '../../components/Head/Head';
import Container from '../../components/Container/Container';
import { NavigateFunction, useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../components/Button/Button';
import {
  continueAccountVerificationService,
  resendAccountVerificationEmailService,
  verifyAccountService,
} from '../../services/accountServices';
import usePopupMessage from '../../hooks/usePopupMessage';
import { AsyncErrorData, getAsyncErrorData } from '../../utils/errorUtils';
import DefaultFormGroup from '../../components/FormGroups/DefaultFormGroup';
import { validateEmail } from '../../utils/validation/userValidation';
import useLoadingOverlay from '../../hooks/useLoadingOverlay';
import { CanceledError } from 'axios';
import useAuth from '../../hooks/useAuth';

export default function AccountVerification(): JSX.Element {
  const [urlSearchParams] = useSearchParams();

  const publicAccountId: string | null = urlSearchParams.get('publicAccountId');
  const verificationToken: string | null = urlSearchParams.get('verificationToken');

  const renderedJsx: JSX.Element = determineRenderedJsx(publicAccountId, verificationToken);

  return (
    <>
      <Head title='Account Verification - Muninnfy' />

      <section className='py-4 h-available flex justify-center items-center'>
        <Container>
          <div className='py-3 px-2 bg-secondary rounded-sm shadow-simple max-w-[36rem] mx-auto'>{renderedJsx}</div>
        </Container>
      </section>
    </>
  );
}

function ContinueAccountVerificationForm(): JSX.Element {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [emailValue, setEmailValue] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate: NavigateFunction = useNavigate();
  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();
  const { displayPopupMessage } = usePopupMessage();
  const { setAuthStatus } = useAuth();

  async function continueAccountVerification(): Promise<void> {
    const email: string = emailValue;
    const newErrorMessage: string | null = validateEmail(email);

    if (newErrorMessage) {
      setErrorMessage(newErrorMessage);
      return;
    }

    try {
      const publicAccountId: string = (await continueAccountVerificationService({ email })).data.publicAccountId;
      navigate(`/sign-up/verification?publicAccountId=${publicAccountId}`);

      displayPopupMessage('Verification request found.', 'success');
    } catch (err: unknown) {
      console.log(err);
      const asyncErrorData: AsyncErrorData | null = getAsyncErrorData(err);

      if (!asyncErrorData) {
        displayPopupMessage('Something went wrong.', 'error');
        return;
      }

      const { status, errMessage, errReason } = asyncErrorData;
      displayPopupMessage(errMessage, 'error');

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
      <h4 className='text-title font-medium mb-1'>Continue account verification.</h4>
      <p className='text-description text-sm mb-1'>Enter the email address you used for signing up below.</p>
      <p className='text-description text-sm mb-2'>Unverified accounts are automatically deleted after 20 minutes.</p>

      <form
        onSubmit={async (e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();

          if (isSubmitting) {
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
          isSubmitBtn={true}
          className='bg-cta border-cta w-full mt-2'
        >
          Continue
        </Button>
      </form>
    </>
  );
}

function ResendAccountVerificationEmail({ publicAccountId }: { publicAccountId: string }): JSX.Element {
  const [title, setTitle] = useState<string>('Ongoing account verification detected.');
  const [description, setDescription] = useState<string>('Find the verification email in your inbox, and click the link to continue.');

  const [btnDisabled, setBtnDisabled] = useState<boolean>(false);
  const [btnTitle, setBtnTitle] = useState<string>('Resend email');
  const [btnNavigateLocation, setBtnNavigateLocation] = useState<string | null>(null);

  const { setAuthStatus } = useAuth();
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
      const asyncErrorData: AsyncErrorData | null = getAsyncErrorData(err);

      if (!asyncErrorData) {
        displayPopupMessage('Something went wrong.', 'error');
        return;
      }

      const { status, errMessage, errReason } = asyncErrorData;
      displayPopupMessage(errMessage, 'error');

      if (status === 403 && errReason === 'signedIn') {
        setAuthStatus('authenticated');
        return;
      }

      setTitle(errMessage);

      if (status === 400 || status === 403) {
        setBtnTitle('Go to homepage');
        setBtnNavigateLocation('/home');

        status === 400
          ? setDescription('Check your inbox for a verification email, or start the sign up process again.')
          : setDescription(`If you still can't find the email, wait 20 minutes and start again.`);
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

function ConfirmAccountVerification({
  publicAccountId,
  verificationToken,
}: {
  publicAccountId: string;
  verificationToken: string;
}): JSX.Element {
  const [verificationFailed, setVerificationFailed] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('Ongoing account verification detected.');
  const [description, setDescription] = useState<string>('Find the verification email in your inbox, and click the link to continue.');
  const [btnTitle, setBtnTitle] = useState<string>('Resend email');
  const [btnNavigateLocation, setBtnNavigateLocation] = useState<string | null>(null);

  const navigate: NavigateFunction = useNavigate();
  const { displayPopupMessage } = usePopupMessage();
  const { setAuthStatus } = useAuth();

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
        const asyncErrorData: AsyncErrorData | null = getAsyncErrorData(err);

        if (!asyncErrorData || !asyncErrorData.errReason || ![400, 403, 404, 409].includes(asyncErrorData.status)) {
          setVerificationFailed(true);
          displayPopupMessage('Something went wrong.', 'error');

          setTitle('Something went wrong.');
          setDescription('Account verification failed due to an unexpected error.');
          setBtnTitle('Try again');

          return;
        }

        const { status, errMessage, errReason } = asyncErrorData;
        displayPopupMessage(errMessage, 'error');

        if (status === 403) {
          setAuthStatus('authenticated');
          return;
        }

        setVerificationFailed(true);
        setTitle(errMessage);

        if (status === 401) {
          const accountDeleted: boolean = errReason.includes('_deleted');
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
    [displayPopupMessage, navigate, publicAccountId, verificationToken, setAuthStatus]
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

function determineRenderedJsx(publicAccountId: string | null, verificationToken: string | null): JSX.Element {
  if (publicAccountId) {
    // verificationToken on its own is not useful and will be ignored
    return verificationToken ? (
      <ConfirmAccountVerification
        publicAccountId={publicAccountId}
        verificationToken={verificationToken}
      />
    ) : (
      <ResendAccountVerificationEmail publicAccountId={publicAccountId} />
    );
  }

  return <ContinueAccountVerificationForm />;
}
