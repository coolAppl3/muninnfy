import { JSX } from 'react';
import Head from '../../components/Head/Head';
import Hero from './components/Hero';
import Features from './components/Features';
import JoinMuninnfy from './components/JoinMuninnfy';

export default function Home(): JSX.Element {
  return (
    <>
      <Head title='Home - Muninnfy' />
      <Hero />
      <Features />
      <JoinMuninnfy />
    </>
  );
}
