import { JSX } from 'react';
import Container from '../../components/Container/Container';
import PrivacyPolicyMdx from './PrivacyPolicy.mdx';
import Head from '../../components/Head/Head';

export default function PrivacyPolicy(): JSX.Element {
  return (
    <>
      <Head title='Privacy Policy - Muninnfy' />

      <main className='py-4'>
        <Container>
          <article className='max-w-[700px] text-description'>
            <PrivacyPolicyMdx />
          </article>
        </Container>
      </main>
    </>
  );
}
