import { JSX } from 'react';
import Container from '../../components/Container/Container';
import Head from '../../components/Head/Head';
import ArticlesNav from '../../components/ArticlesNav/ArticlesNav';

export default function Faq(): JSX.Element {
  return (
    <>
      <Head title='Privacy Policy - Muninnfy' />

      <main className='py-4'>
        <Container>
          <section className='grid grid-cols-12 items-start gap-4'>
            {/* TODO: continue implementation */}

            <ArticlesNav />
          </section>
        </Container>
      </main>
    </>
  );
}
