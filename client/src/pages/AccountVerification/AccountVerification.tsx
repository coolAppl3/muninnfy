import { JSX } from 'react';
import Head from '../../components/Head/Head';
import Container from '../../components/Container/Container';
import { useSearchParams } from 'react-router-dom';
import ConfirmAccountVerification from './components/ConfirmAccountVerification';
import ResendAccountVerificationEmail from './components/ResendAccountVerificationEmail';
import ContinueAccountVerificationForm from './components/ContinueAccountVerificationForm';

export default function AccountVerification(): JSX.Element {
  const [urlSearchParams] = useSearchParams();

  const publicAccountId: string | null = urlSearchParams.get('publicAccountId');
  const verificationToken: string | null = urlSearchParams.get('verificationToken');

  return (
    <>
      <Head title='Account Verification - Muninnfy' />

      <section className='py-4 h-available flex justify-center items-center'>
        <Container>
          <div className='py-3 px-2 bg-secondary rounded-sm shadow-simple max-w-[36rem] mx-auto'>
            {
              <AccountVerificationChildren
                publicAccountId={publicAccountId}
                verificationToken={verificationToken}
              />
            }
          </div>
        </Container>
      </section>
    </>
  );
}

type AccountVerificationChildrenProps = {
  publicAccountId: string | null;
  verificationToken: string | null;
};

function AccountVerificationChildren({ publicAccountId, verificationToken }: AccountVerificationChildrenProps): JSX.Element {
  if (!publicAccountId) {
    return <ContinueAccountVerificationForm />;
  }

  if (!verificationToken) {
    return <ResendAccountVerificationEmail publicAccountId={publicAccountId} />;
  }

  return (
    <ConfirmAccountVerification
      publicAccountId={publicAccountId}
      verificationToken={verificationToken}
    />
  );
}
