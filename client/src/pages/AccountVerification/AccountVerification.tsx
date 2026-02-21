import { Dispatch, JSX, SetStateAction, useState } from 'react';
import Head from '../../components/Head/Head';
import Container from '../../components/Container/Container';
import { NavigateFunction, useNavigate, useSearchParams } from 'react-router-dom';
import ConfirmAccountVerification from './components/ConfirmAccountVerification';
import ResendAccountVerificationEmail from './components/ResendAccountVerificationEmail';
import ContinueAccountVerificationForm from './components/ContinueAccountVerificationForm';
import { isValidUuid } from '../../utils/validation/generalValidation';
import InstructionCard from '../../components/InstructionCard/InstructionCard';

export default function AccountVerification(): JSX.Element {
  const [urlSearchParams] = useSearchParams();

  const publicAccountId: string | null = urlSearchParams.get('publicAccountId');
  const verificationToken: string | null = urlSearchParams.get('verificationToken');

  const [isValidVerificationLink, setIsValidVerificationLink] = useState<boolean>(
    (publicAccountId ? isValidUuid(publicAccountId) : true) && (verificationToken ? isValidUuid(verificationToken) : true)
  );

  return (
    <>
      <Head title='Account Verification - Muninnfy' />

      <section className='py-4 h-available flex justify-center items-center'>
        <Container>
          <div className='py-3 px-2 bg-secondary rounded-sm shadow-simple w-full max-w-[36rem] mx-auto'>
            <AccountVerificationChildren
              isValidVerificationLink={isValidVerificationLink}
              setIsValidVerificationLink={setIsValidVerificationLink}
              publicAccountId={publicAccountId}
              verificationToken={verificationToken}
            />
          </div>
        </Container>
      </section>
    </>
  );
}

type AccountVerificationChildrenProps = {
  isValidVerificationLink: boolean;
  setIsValidVerificationLink: Dispatch<SetStateAction<boolean>>;
  publicAccountId: string | null;
  verificationToken: string | null;
};

function AccountVerificationChildren({
  isValidVerificationLink,
  setIsValidVerificationLink,
  publicAccountId,
  verificationToken,
}: AccountVerificationChildrenProps): JSX.Element {
  const navigate: NavigateFunction = useNavigate();

  if (!isValidVerificationLink) {
    return (
      <InstructionCard
        title='Invalid verification link.'
        description='Check your inbox for a verification email and make sure you click the link within.'
        btnTitle='Go to homepage'
        btnDisabled={false}
        onClick={() => navigate('/home')}
      />
    );
  }

  if (!publicAccountId) {
    return <ContinueAccountVerificationForm />;
  }

  if (!verificationToken) {
    return (
      <ResendAccountVerificationEmail
        publicAccountId={publicAccountId}
        setIsValidVerificationLink={setIsValidVerificationLink}
      />
    );
  }

  return (
    <ConfirmAccountVerification
      publicAccountId={publicAccountId}
      verificationToken={verificationToken}
      setIsValidVerificationLink={setIsValidVerificationLink}
    />
  );
}
