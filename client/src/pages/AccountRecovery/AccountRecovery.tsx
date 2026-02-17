import { Dispatch, JSX, SetStateAction, useState } from 'react';
import Head from '../../components/Head/Head';
import Container from '../../components/Container/Container';
import StartAccountRecovery from './components/StartAccountRecovery';
import ResendAccountRecoveryEmail from './components/ResendAccountRecoveryEmail';
import { useSearchParams } from 'react-router-dom';
import ConfirmAccountRecovery from './components/ConfirmAccountRecovery';
import { isValidUuid } from '../../utils/validation/generalValidation';
import { InvalidRecoveryLink } from './components/InvalidRecoveryLink';

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
  if (!linkParamsValid) {
    return <InvalidRecoveryLink />;
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

  return <ConfirmAccountRecovery />;
}
