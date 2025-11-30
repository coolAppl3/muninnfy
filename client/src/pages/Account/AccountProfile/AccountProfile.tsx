import { JSX } from 'react';
import StatisticItem from '../../../components/StatisticItem/StatisticItem';
import AccountProfileHeader from './components/AccountProfileHeader/AccountProfileHeader';

export function AccountProfile(): JSX.Element {
  return (
    <>
      <AccountProfileHeader />

      <div className='text-description/50 text-xs mb-[1.2rem]'>
        <p className='leading-[1] mb-[4px]'>e8bea0eb-140d-4e07-a13e-ec47a88311e5</p>
        <p className='leading-[1]'>Created Sep 23rd, 2025</p>
      </div>

      <div className='grid md:grid-cols-2 gap-1 text-sm text-description'>
        <StatisticItem
          title='Display name'
          value='John doe'
        />

        <StatisticItem
          title='Username'
          value='johnDoe23'
        />

        <StatisticItem
          title='Email address'
          value='johnDoe23@example.com'
          className='md:col-span-2'
        />
      </div>
    </>
  );
}
