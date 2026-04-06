import { JSX } from 'react';
import Container from '../../components/Container/Container';
import TermsOfServiceMdx from './TermsOfService.mdx';

export default function TermsOfService(): JSX.Element {
  return (
    <main className='py-4'>
      <Container>
        <article className='max-w-[700px] text-description'>
          <TermsOfServiceMdx />
        </article>
      </Container>
    </main>
  );
}
