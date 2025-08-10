import { JSX } from 'react';
import { Head } from '../../components/Head/Head';
import Hero from './Hero';

export default function Home(): JSX.Element {
  return (
    <>
      <Head title='Home - Muninnfy' />
      <Hero />
    </>
  );
}
