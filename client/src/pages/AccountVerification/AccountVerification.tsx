import { ChangeEvent, FormEvent, JSX, MouseEventHandler, useEffect, useMemo, useState } from 'react';
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
import useInfoModal from '../../hooks/useInfoModal';
import DefaultFormGroup from '../../components/FormGroups/DefaultFormGroup';
import { validateEmail } from '../../utils/validation';
import useLoadingOverlay from '../../hooks/useLoadingOverlay';

export default function AccountVerification(): JSX.Element {
  const [searchParams] = useSearchParams();

  const publicAccountId: string | null = searchParams.get('publicAccountId');
  const verificationToken: string | null = searchParams.get('verificationToken');

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

      if (!errReason || ![400, 404].includes(status)) {
        return;
      }

      setErrorMessage(errMessage);
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
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const navigate: NavigateFunction = useNavigate();

  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();
  const { displayPopupMessage } = usePopupMessage();
  const { displayInfoModal, removeInfoModal } = useInfoModal();

  const infoModalErrorRecord: Record<number, { description: string | undefined; btnTitle?: string; onClick?: () => void }> = {
    400: {
      description: 'Check your inbox for a verification email, or start the sign up process again.',
      onClick: () => navigate('/sign-up/verification'),
    },

    403: {
      description: `Emails may take a minute to arrive, and could end up in your spam folder.\nIf you still can't find the email, wait 20 minutes and start again.`,
      onClick: undefined,
    },

    404: {
      description: `Accounts are deleted within 20 minutes of being created if left unverified.\nYou can always start the sign up process again.`,
      btnTitle: 'Sign up again',
      onClick: () => navigate('/sign-up'),
    },

    409: {
      description: 'You can simply proceed with singing in.',
      btnTitle: 'Sign in',
      onClick: () => navigate('/sign-in'),
    },
  };

  async function resendAccountVerificationEmail(): Promise<void> {
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
        return;
      }

      if (!errReason || ![400, 403, 404, 409].includes(status)) {
        return;
      }

      const description: string | undefined = infoModalErrorRecord[status]?.description;
      const onClick: (() => void) | undefined = infoModalErrorRecord[status]?.onClick;
      const btnTitle: string | undefined = infoModalErrorRecord[status]?.btnTitle;

      displayInfoModal({
        title: errMessage,
        description,
        btnTitle: btnTitle || 'Okay',
        onClick: onClick || removeInfoModal,
      });
    }
  }

  return (
    <>
      <h4 className='text-title font-medium mb-1'>Ongoing account verification detected.</h4>
      <p className='text-description text-sm mb-2'>Find the verification email in your inbox, and click the link to continue.</p>
      <Button
        className='bg-description border-description text-dark w-full'
        onClick={async () => {
          if (isDisabled) {
            return;
          }

          setIsDisabled(true);
          displayLoadingOverlay();

          await resendAccountVerificationEmail();

          removeLoadingOverlay();
          setTimeout(() => setIsDisabled(false), 3000);
        }}
        disabled={isDisabled}
      >
        Resend email
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
  interface ConfirmAccountVerificationState {
    title: string;
    description?: string;
    btnTitle: string;
    onClick: MouseEventHandler<HTMLButtonElement>;
  }

  const [verificationState, setVerificationState] = useState<ConfirmAccountVerificationState | null>(null);

  const navigate: NavigateFunction = useNavigate();
  const { displayPopupMessage } = usePopupMessage();

  const verificationErrorRecord: Record<number, { description: string | undefined; btnTitle?: string; onClick?: () => void }> = useMemo(
    () => ({
      400: {
        description: `Your verification link is invalid or malformed.Make sure you've copied the correct link.`,
        onClick: () => navigate('/verification'),
      },

      403: {
        description: undefined,
        onClick: () => navigate('/home'),
      },

      404: {
        description: `Account doesn't exist or may have been deleted after remaining unverified for longer than 20 minutes.`,
        btnTitle: 'Sign up',
        onClick: () => navigate('/sign-up'),
      },

      409: {
        description: 'You may proceed with singing in.',
        btnTitle: 'Sign in',
        onClick: () => navigate('/sign-in'),
      },
    }),
    [navigate]
  );

  useEffect(() => {
    let ignore = false;

    const verifyAccount = async (): Promise<void> => {
      try {
        await verifyAccountService({ publicAccountId, verificationToken });

        if (ignore) {
          return;
        }

        displayPopupMessage('Account verified.', 'success');
        setVerificationState({
          title: 'Account verified',
          description: 'You may now proceed with singing in.',
          btnTitle: 'Sign in',
          onClick: () => navigate('/sign-in'),
        });
      } catch (err: unknown) {
        if (ignore) {
          return;
        }

        console.log(err);
        const asyncErrorData: AsyncErrorData | null = getAsyncErrorData(err);

        if (!asyncErrorData) {
          displayPopupMessage('Something went wrong.', 'error');
          setVerificationState({
            title: 'Something went wrong.',
            description: 'Account verification failed due to an unexpected error.',
            btnTitle: 'Okay',
            onClick: () => navigate('/home'),
          });

          return;
        }

        const { status, errMessage, errReason } = asyncErrorData;
        displayPopupMessage(errMessage, 'error');

        if (!errReason || ![400, 403, 404, 409].includes(status)) {
          setVerificationState({
            title: 'Something went wrong.',
            description: 'Account verification failed due to an internal server error.',
            btnTitle: 'Okay',
            onClick: () => navigate('/home'),
          });

          return;
        }

        if (status === 401) {
          const accountDeleted: boolean = errReason.includes('_deleted');
          const description: string = accountDeleted
            ? 'Account deleted due to too many failed verification attempts.'
            : `Your verification link is invalid or malformed. Make sure you've copied the correct link.`;

          setVerificationState({
            title: errMessage,
            description,
            btnTitle: accountDeleted ? 'Sign up again' : 'Okay',
            onClick: () => navigate(`/sign-up${accountDeleted ? '/verification' : ''}`),
          });

          return;
        }

        const description: string | undefined = verificationErrorRecord[status]?.description;
        const onClick: (() => void) | undefined = verificationErrorRecord[status]?.onClick;
        const btnTitle: string | undefined = verificationErrorRecord[status]?.btnTitle;

        setVerificationState({
          title: errMessage,
          description,
          btnTitle: btnTitle || 'Okay',
          onClick: onClick || (() => navigate('/home')),
        });
      }
    };

    verifyAccount();

    return () => {
      ignore = true;
    };
  }, [displayPopupMessage, navigate, publicAccountId, verificationToken, verificationErrorRecord]);

  return (
    <>
      {verificationState ? (
        <>
          <h4 className='text-title font-medium mb-1'>{verificationState.title}</h4>
          <p className='text-description text-sm'>{verificationState?.description}</p>

          <Button
            className='bg-description border-description text-dark w-full mt-2'
            onClick={verificationState.onClick}
          >
            {verificationState.btnTitle}
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
