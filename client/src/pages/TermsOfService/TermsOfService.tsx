import { JSX } from 'react';
import Container from '../../components/Container/Container';
import TermsOfServiceMdx from './TermsOfService.mdx';
import Head from '../../components/Head/Head';
import { ArticlesNav } from '../../components/ArticlesNav/ArticlesNav';

export default function TermsOfService(): JSX.Element {
  return (
    <>
      <Head title='Terms of Service - Muninnfy' />

      <main className='py-4'>
        <Container>
          <section className='grid grid-cols-12 items-start gap-4'>
            <article className='text-description col-span-12 md:col-span-8'>
              <TermsOfServiceMdx />
            </article>

            <ArticlesNav />
          </section>
        </Container>
      </main>
    </>
  );
}
