import { JSX } from 'react';
import Head from '../../components/Head/Head';
import Container from '../../components/Container/Container';
import StartAccountRecovery from './components/StartAccountRecovery';
import ResendAccountRecoveryEmail from './components/ResendAccountRecoveryEmail';
import { useSearchParams } from 'react-router-dom';
import ConfirmAccountRecovery from './components/ConfirmAccountRecovery';

export default function AccountRecovery(): JSX.Element {
  const [urlSearchParams] = useSearchParams();

  const publicAccountId: string | null = urlSearchParams.get('publicAccountId');
  const recoveryToken: string | null = urlSearchParams.get('recoveryToken');

  return (
    <>
      <Head title='Account Recovery - Muninnfy' />

      <section className='py-4 h-available flex justify-center items-center'>
        <Container>
          <div className='py-3 px-2 bg-secondary rounded-sm shadow-simple max-w-[36rem] mx-auto'>
            <AccountRecoveryChildren
              publicAccountId={publicAccountId}
              recoveryToken={recoveryToken}
            />
          </div>
        </Container>
      </section>
    </>
  );
}

type AccountRecoveryChildrenProps = {
  publicAccountId: string | null;
  recoveryToken: string | null;
};

function AccountRecoveryChildren({ publicAccountId, recoveryToken }: AccountRecoveryChildrenProps): JSX.Element {
  if (!publicAccountId) {
    return <StartAccountRecovery />;
  }

  if (!recoveryToken) {
    return <ResendAccountRecoveryEmail />;
  }

  return <ConfirmAccountRecovery />;
}
