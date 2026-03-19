import { JSX } from 'react';
import useAccountLocation from '../../../Account/hooks/useAccountLocation';
import ViewAccountProfile from '../ViewAccountProfile/ViewAccountProfile';
import { ViewAccountDetailsType } from '../../../../types/accountTypes';
import AccountSocial from '../../../Account/AccountSocial/AccountSocial';

export default function ViewAccountContent({ viewAccountDetails }: { viewAccountDetails: ViewAccountDetailsType }): JSX.Element {
  const { accountLocation } = useAccountLocation();

  return (
    <div className='p-2 bg-secondary rounded-sm col-span-12 md:col-span-9 shadow-simple-tiny md:min-h-full'>
      {accountLocation === 'profile' ? <ViewAccountProfile viewAccountDetails={viewAccountDetails} /> : <AccountSocial />}
    </div>
  );
}
