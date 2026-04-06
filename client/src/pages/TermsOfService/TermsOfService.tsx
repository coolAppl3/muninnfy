import { JSX } from 'react';
import Container from '../../components/Container/Container';
import TermsOfServiceMdx from './TermsOfService.mdx';
import Head from '../../components/Head/Head';

export default function TermsOfService(): JSX.Element {
  return (
    <>
      <Head title='Terms of Service - Muninnfy' />

      <main className='py-4'>
        <Container>
          <article className='max-w-[700px] text-description'>
            <TermsOfServiceMdx />
          </article>
        </Container>
      </main>
    </>
  );
}
