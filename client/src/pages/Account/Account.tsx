import { JSX } from 'react';
import Head from '../../components/Head/Head';
import AccountSidebar from './AccountSidebar/AccountSidebar';
import Container from '../../components/Container/Container';
import AccountContent from './AccountContent/AccountContent';
import AccountLocationProvider from './providers/AccountLocationProvider';
import AccountNavMenu from './AccountNavMenu/AccountNavMenu';

export default function Account(): JSX.Element {
  return (
    <>
      <Head title='Account - Muninnfy' />

      <AccountLocationProvider>
        <main className='py-4'>
          <Container className='grid grid-cols-12 gap-1'>
            <AccountSidebar />
            <AccountNavMenu />
            <AccountContent />
          </Container>
        </main>
      </AccountLocationProvider>
    </>
  );
}
