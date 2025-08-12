import { JSX } from 'react';
import './Home.css';
import { Head } from '../../components/Head/Head';
import Hero from './Hero';
import Features from './Features';

export default function Home(): JSX.Element {
  return (
    <>
      <Head title='Home - Muninnfy' />
      <Hero />
      <Features />
    </>
  );
}
