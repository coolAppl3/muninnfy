import { JSX } from 'react';
import Container from '../../components/Container/Container';
import Button from '../../components/Button/Button';
import SignUp_Illustration from '../../assets/svg/SignUp_Illustration.svg?react';
import { NavigateFunction, useNavigate } from 'react-router-dom';

export default function JoinMuninnfy(): JSX.Element {
  const navigate: NavigateFunction = useNavigate();

  return (
    <section className='join-muninnfy py-4 bg-secondary/50'>
      <Container>
        <div className='join-muninnfy-container md:flex md:justify-between md:items-center md:gap-2'>
          <div className='content md:!max-w-1/2'>
            <h2 className='text-title text-4xl font-bold mb-2'>Join Muninnfy.</h2>
            <p className='text-description font-medium mb-1'>
              Muninnfy is completely free — crafted to deliver a truly personalized experience that comes alive when you sign up.
            </p>
            <p className='text-description font-medium mb-2'>
              Try it out as a guest with a temporary wishlist, but to unlock its full power and make it truly yours, create an account.
            </p>

            <div className='btn-container flex flex-col gap-1 sm:flex-row-reverse justify-end'>
              <Button
                className='bg-cta border-cta text-dark w-full sm:w-fit'
                onClick={() => navigate('/sign-up')}
              >
                Create an account
              </Button>
              <Button
                className='bg-primary border-title text-title w-full sm:w-fit'
                onClick={() => navigate('/wishlist/new')}
              >
                Try it as a guest
              </Button>
            </div>
          </div>

          <SignUp_Illustration className='hidden md:block max-h-[30rem]' />
        </div>
      </Container>
    </section>
  );
}
