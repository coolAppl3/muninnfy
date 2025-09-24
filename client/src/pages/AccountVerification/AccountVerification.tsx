import { JSX } from 'react';
import { Head } from '../../components/Head/Head';
import Container from '../../components/Container/Container';
import { useSearchParams } from 'react-router-dom';
import ConfirmAccountVerification from './components/ConfirmAccountVerification';
import ResendAccountVerificationEmail from './components/ResendAccountVerificationEmail';
import ContinueAccountVerificationForm from './components/ContinueAccountVerificationForm';

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
