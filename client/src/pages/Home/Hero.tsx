import { JSX } from 'react';
import Button from '../../components/Button/Button';
import Container from '../../components/Container/Container';
import HeroGradient from '../../assets/svg/HeroGradient.svg?react';
import HeroArc from '../../assets/svg/HeroArc.svg?react';
import { NavigateFunction, useNavigate } from 'react-router-dom';

export default function Hero(): JSX.Element {
  const navigate: NavigateFunction = useNavigate();

  return (
    <section className='hero relative overflow-hidden py-4'>
      <HeroGradient className='absolute top-0 left-0 w-[140%] sm:w-full h-full z-0' />
      <Container>
        <div className='hero-container max-w-full md:max-w-1/2 h-full flex flex-col justify-center items-start gap-1'>
          <h1 className='text-title font-bold text-[4.6rem] leading-[1]'>
            Your Wishlists, <span className='text-cta italic'>Reimagined.</span>
          </h1>
          <p className='text-description font-medium text-lg leading-[1.2]'>The app you always wished existed! Flexible, shareable, and built to do more.</p>
          <Button
            className='bg-cta border-cta text-dark mt-1 w-full xs:w-fit'
            onClick={() => navigate('/new-wishlist')}
          >
            Create a wishlist
          </Button>
        </div>
      </Container>
      <HeroArc className='absolute bottom-[-1rem] left-0 w-full h-auto z-0 text-primary' />
    </section>
  );
}
