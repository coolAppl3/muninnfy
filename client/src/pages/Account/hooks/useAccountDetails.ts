import { useContext } from 'react';
import AccountDetailsContext, { AccountDetailsContextType } from '../contexts/AccountDetailsContext';

export default function useAccountDetails(): AccountDetailsContextType {
  const context = useContext<AccountDetailsContextType | null>(AccountDetailsContext);

  if (!context) {
    throw new Error('useAccountDetails must be used within AccountDetailsProvider.');
  }

  return context;
}
