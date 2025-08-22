import { JSX } from 'react';
import { Head } from '../../components/Head/Head';
import Container from '../../components/Container/Container';
import { useSearchParams } from 'react-router-dom';

export default function AccountVerification(): JSX.Element {
  const [searchParams] = useSearchParams();

  const publicAccountId: string | null = searchParams.get('publicAccountId');
  const verificationToken: string | null = searchParams.get('verificationToken');

  const renderedJsx: JSX.Element = determineRenderedJsx(publicAccountId, verificationToken);

  return (
    <>
      <Head title='Account Verification - Muninnfy' />

      <section className='py-4 h-available flex justify-center items-center'>
        <Container>{renderedJsx}</Container>
      </section>
    </>
  );
}

function ContinueAccountVerificationForm(): JSX.Element {
  return <div>{/* TODO: implement */}</div>;
}

function ResendAccountVerification(): JSX.Element {
  return <div>{/* TODO: implement */}</div>;
}

function ConfirmAccountVerification(): JSX.Element {
  return <div>{/* TODO: implement */}</div>;
}

function determineRenderedJsx(publicAccountId: string | null, verificationToken: string | null): JSX.Element {
  if (publicAccountId) {
    // verificationToken on its own is not useful
    return verificationToken ? <ConfirmAccountVerification /> : <ResendAccountVerification />;
  }

  return <ContinueAccountVerificationForm />;
}
