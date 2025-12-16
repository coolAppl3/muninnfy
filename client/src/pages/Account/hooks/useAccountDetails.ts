import { useContext } from 'react';
import AccountContext, { AccountDetailsContextType } from '../contexts/AccountDetailsContext';

export default function useAccountDetails(): AccountDetailsContextType {
  const context = useContext<AccountDetailsContextType | null>(AccountContext);

  if (!context) {
    throw new Error('useAccountDetails must be used within AccountDetailsProvider.');
  }

  return context;
}
