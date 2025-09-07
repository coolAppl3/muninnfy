import { JSX } from 'react';
import { Head } from '../../components/Head/Head';
import Container from '../../components/Container/Container';
import Button from '../../components/Button/Button';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import useHistory from '../../hooks/useHistory';

export default function NotFound(): JSX.Element {
  const navigate: NavigateFunction = useNavigate();
  const { referrerLocation } = useHistory();

  return (
    <>
      <Head title='Not Found - Muninnfy' />

      <section className='py-4 h-available flex justify-center items-center'>
        <Container>
          <div className='py-3 px-2 bg-secondary rounded-sm shadow-simple max-w-[36rem] mx-auto'>
            <h1 className='text-title font-medium mb-1'>Page not found</h1>
            <p className='text-description text-sm mb-2'>Double-check the link you've entered and try again.</p>

            <Button
              className='bg-cta border-cta w-full'
              onClick={() => (referrerLocation ? navigate(referrerLocation) : navigate('/home'))}
            >
              {referrerLocation ? 'Go back' : 'Go to homepage'}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
