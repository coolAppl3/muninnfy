import { JSX } from 'react';
import Container from '../../components/Container/Container';
import Head from '../../components/Head/Head';
import ArticlesNav from '../../components/ArticlesNav/ArticlesNav';
import AccordionItem from './components/AccordionItem';
import { Link } from 'react-router-dom';

export default function Faq(): JSX.Element {
  return (
    <>
      <Head title='FAQ - Muninnfy' />

      <main className='py-4'>
        <Container>
          <section className='md:grid md:grid-cols-12 items-start gap-4'>
            <div className='md:col-span-8'>
              <h2 className='md:hidden text-title text-2xl font-medium mb-2'>
                Frequently Asked Questions
              </h2>

              <div className='text-description'>
                <AccordionItem
                  question='Is Muninnfy free to use?'
                  answer='Yes, Muninnfy is completely free to use.'
                />

                <AccordionItem
                  question='Do I need an account to use Muninnfy?'
                  answer='Yes. Muninnfy is designed to provide a personalized experience, which requires you to create an account.'
                />

                <AccordionItem
                  question='What if I forget my password?'
                  answer='You can regain access to your account by using the password recovery option on the login page.'
                />

                <AccordionItem
                  question='Can I delete my account?'
                  answer='Yes. You can delete your account at any time through your account settings. This action is permanent.'
                />

                <AccordionItem
                  question='Is my data secure?'
                  answer={
                    <>
                      Muninnfy implements industry-standard security measures to protect your
                      information and prevent unauthorized access. However, no system can be
                      guaranteed to be 100% secure. For more details, please refer to our{' '}
                      <Link
                        to='/privacy-policy'
                        className='link'
                      >
                        Privacy Policy
                      </Link>
                      .
                    </>
                  }
                />

                <AccordionItem
                  question='How can I get in touch?'
                  answer={
                    <>
                      You can contact us at{' '}
                      <span className='text-title font-medium'>support@muninnfy.com</span> for
                      any questions or requests. We'll do our best to respond as soon as
                      possible.
                    </>
                  }
                />
              </div>
            </div>

            <ArticlesNav />
          </section>
        </Container>
      </main>
    </>
  );
}
