import { JSX } from 'react';
import Head from '../../components/Head/Head';
import Hero from './components/Hero';
import Features from './components/Features';
import JoinMuninnfy from './components/JoinMuninnfy';

export default function Home(): JSX.Element {
  return (
    <main>
      <Head
        title='Home - Muninnfy'
        metaDescription='Create, organize, and share your personal wishlists for any occasion. The simplest way to keep track of your gift ideas and share them with friends.'
      />
      <Hero />
      <Features />
      <JoinMuninnfy />
    </main>
  );
}
