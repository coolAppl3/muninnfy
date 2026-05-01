import { JSX } from 'react';
import Head from '../../components/Head/Head';
import Container from '../../components/Container/Container';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import useHistory from '../../hooks/useHistory';
import InstructionCard from '../../components/InstructionCard/InstructionCard';

export default function NotFound(): JSX.Element {
  const navigate: NavigateFunction = useNavigate();
  const { referrerLocation } = useHistory();

  return (
    <>
      <Head
        title='Not Found - Muninnfy'
        metaDescription='Page not found. Click to go back.'
      />

      <main className='py-4 h-available flex justify-center items-center'>
        <Container>
          <div className='py-3 px-2 bg-secondary rounded-sm shadow-simple max-w-[36rem] mx-auto'>
            <InstructionCard
              title='Page not found.'
              description={`Double-check the link you've entered and try again.`}
              btnTitle={referrerLocation ? 'Go back' : 'Go to homepage'}
              btnDisabled={false}
              onClick={() => navigate(referrerLocation || '/home')}
            />
          </div>
        </Container>
      </main>
    </>
  );
}
