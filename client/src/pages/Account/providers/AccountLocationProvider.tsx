import { JSX, ReactNode, useMemo, useState } from 'react';
import AccountLocationContext, { AccountLocation, AccountLocationContextType } from '../contexts/AccountLocationContext';

type AccountLocationProviderProps = {
  children: ReactNode;
};

export default function AccountLocationProvider({ children }: AccountLocationProviderProps): JSX.Element {
  const [accountLocation, setAccountLocation] = useState<AccountLocation>('overview');

  const contextValue: AccountLocationContextType = useMemo(() => ({ accountLocation, setAccountLocation }), [accountLocation]);
  return <AccountLocationContext value={contextValue}>{children}</AccountLocationContext>;
}
