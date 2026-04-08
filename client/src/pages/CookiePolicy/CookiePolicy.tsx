import { JSX } from 'react';
import Container from '../../components/Container/Container';
import CookiePolicyMdx from './CookiePolicy.mdx';
import Head from '../../components/Head/Head';
import ArticlesNav from '../../components/ArticlesNav/ArticlesNav';

export default function CookiePolicy(): JSX.Element {
  return (
    <>
      <Head title='Privacy Policy - Muninnfy' />

      <main className='py-4'>
        <Container>
          <section className='grid grid-cols-12 items-start gap-4'>
            <article className='text-description col-span-12 md:col-span-8'>
              <CookiePolicyMdx />
            </article>

            <ArticlesNav />
          </section>
        </Container>
      </main>
    </>
  );
}
