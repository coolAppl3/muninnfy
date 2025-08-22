import { JSX } from 'react';
import { Head } from '../../components/Head/Head';
import Container from '../../components/Container/Container';
import { NavigateFunction, useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../components/Button/Button';
import { resendAccountVerificationEmailService } from '../../services/accountServices';
import usePopupMessage from '../../hooks/usePopupMessage';
import { AsyncErrorData, getAsyncErrorData } from '../../utils/errorUtils';
import useInfoModal from '../../hooks/useInfoModal';

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
  return <>{/* TODO: implement */}</>;
}

function ResendAccountVerificationEmail({ publicAccountId }: { publicAccountId: string }): JSX.Element {
  const navigate: NavigateFunction = useNavigate();

  const { displayPopupMessage } = usePopupMessage();
  const { displayInfoModal, removeInfoModal } = useInfoModal();

  const infoModalErrorRecord: Record<number, { description: string | undefined; onClick?: () => void }> = {
    400: {
      description: 'Check your inbox for a verification email, or start the sign up process again.',
      onClick: () => navigate('/account/verification'),
    },

    403: {
      description: `Emails may a minute to reach you, and could end up in your spam folder.\nIf you still can't find the email, wait 20 minutes and start again.`,
      onClick: undefined,
    },

    404: {
      description: `Accounts are deleted within 20 minutes of being created if left unverified.\nYou can always start the sign up process again.`,
      onClick: () => navigate('/sign-up'),
    },

    409: { description: 'You can simply proceed with singing in.', onClick: () => navigate('/sign-in') },
  };

  async function handleOnClick(): Promise<void> {
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

      if (!errReason || ![400, 403, 404, 409].includes(status)) {
        return;
      }

      const description: string | undefined = infoModalErrorRecord[403]?.description;
      const onClick: (() => void) | undefined = infoModalErrorRecord[403]?.onClick;

      displayInfoModal({
        title: errMessage,
        description,
        btnTitle: 'Okay',
        onClick: onClick || removeInfoModal,
      });
    }
  }

  return (
    <>
      <h4 className='text-title font-medium mb-1'>Ongoing account verification detected.</h4>
      <p className='text-description text-sm mb-2'>Check your inbox for a verification link, and click it to continue.</p>
      <Button
        className='bg-description border-description text-dark w-full'
        onClick={handleOnClick}
      >
        Resend email
      </Button>
    </>
  );
}

function ConfirmAccountVerification(): JSX.Element {
  return <>{/* TODO: implement */}</>;
}

function determineRenderedJsx(publicAccountId: string | null, verificationToken: string | null): JSX.Element {
  if (publicAccountId) {
    // verificationToken on its own is not useful and will be ignored
    return verificationToken ? <ConfirmAccountVerification /> : <ResendAccountVerificationEmail publicAccountId={publicAccountId} />;
  }

  return <ContinueAccountVerificationForm />;
}
