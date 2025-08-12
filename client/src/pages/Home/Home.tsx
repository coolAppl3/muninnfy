import { JSX } from 'react';
import './Home.css';
import { Head } from '../../components/Head/Head';
import Hero from './Hero';
import Features from './Features';
import JoinMuninnfy from './JoinMuninnfy';

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
