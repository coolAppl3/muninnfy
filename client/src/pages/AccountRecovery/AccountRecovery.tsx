import { Dispatch, JSX, SetStateAction, useState } from 'react';
import Head from '../../components/Head/Head';
import Container from '../../components/Container/Container';
import StartAccountRecovery from './components/StartAccountRecovery';
import ResendAccountRecoveryEmail from './components/ResendAccountRecoveryEmail';
import { NavigateFunction, useNavigate, useSearchParams } from 'react-router-dom';
import ConfirmAccountRecovery from './components/ConfirmAccountRecovery';
import { isValidUuid } from '../../utils/validation/generalValidation';
import InstructionCard from '../../components/InstructionCard/InstructionCard';

export default function AccountRecovery(): JSX.Element {
  const [urlSearchParams] = useSearchParams();

  const publicAccountId: string | null = urlSearchParams.get('publicAccountId');
  const recoveryToken: string | null = urlSearchParams.get('recoveryToken');

  const [isValidRecoveryLink, setIsValidRecoveryLink] = useState<boolean>(
    (publicAccountId ? isValidUuid(publicAccountId) : true) && (recoveryToken ? isValidUuid(recoveryToken) : true)
  );

  return (
    <>
      <Head title='Account Recovery - Muninnfy' />

      <section className='py-4 h-available flex justify-center items-center'>
        <Container>
          <div className='py-3 px-2 bg-secondary rounded-sm shadow-simple max-w-[36rem] mx-auto'>
            <AccountRecoveryChildren
              linkParamsValid={isValidRecoveryLink}
              setIsValidRecoveryLink={setIsValidRecoveryLink}
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
  linkParamsValid: boolean;
  setIsValidRecoveryLink: Dispatch<SetStateAction<boolean>>;
  publicAccountId: string | null;
  recoveryToken: string | null;
};

function AccountRecoveryChildren({
  linkParamsValid,
  setIsValidRecoveryLink,
  publicAccountId,
  recoveryToken,
}: AccountRecoveryChildrenProps): JSX.Element {
  const navigate: NavigateFunction = useNavigate();

  if (!linkParamsValid) {
    return (
      <InstructionCard
        title='Invalid recovery link.'
        description='Check your inbox for a recovery email and make sure you click the link within.'
        btnTitle='Go to homepage'
        btnDisabled={false}
        onClick={() => navigate('/home')}
      />
    );
  }

  if (!publicAccountId) {
    return <StartAccountRecovery />;
  }

  if (!recoveryToken) {
    return (
      <ResendAccountRecoveryEmail
        publicAccountId={publicAccountId}
        setIsValidRecoveryLink={setIsValidRecoveryLink}
      />
    );
  }

  return (
    <ConfirmAccountRecovery
      publicAccountId={publicAccountId}
      recoveryToken={recoveryToken}
      setIsValidRecoveryLink={setIsValidRecoveryLink}
    />
  );
}
