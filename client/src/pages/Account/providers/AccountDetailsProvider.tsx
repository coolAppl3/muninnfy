import { JSX, ReactNode, useMemo, useState } from 'react';
import AccountDetailsContext, { AccountDetailsContextType } from '../contexts/AccountDetailsContext';
import { AccountDetailsType } from '../../../types/accountTypes';

type AccountDetailsProviderProps = {
  initialAccountDetails: AccountDetailsType;
  children: ReactNode;
};

export default function AccountDetailsProvider({ initialAccountDetails, children }: AccountDetailsProviderProps): JSX.Element {
  const [accountDetails, setAccountDetails] = useState<AccountDetailsType>(initialAccountDetails);

  const contextValue: AccountDetailsContextType = useMemo(
    () => ({
      accountDetails,
      setAccountDetails,
    }),
    [accountDetails]
  );

  return <AccountDetailsContext value={contextValue}>{children}</AccountDetailsContext>;
}
