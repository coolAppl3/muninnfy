import { useContext } from 'react';
import AccountProfileContext, { AccountProfileContextType } from '../AccountProfile/context/AccountProfileContext';

export default function useAccountProfile(): AccountProfileContextType {
  const context = useContext<AccountProfileContextType | null>(AccountProfileContext);

  if (!context) {
    throw new Error('useAccountProfile must be used within AccountProfileProvider.');
  }

  return context;
}
