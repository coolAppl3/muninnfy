import { useContext } from 'react';
import AccountSocialDetailsContext, { AccountSocialDetailsContextType } from '../contexts/AccountSocialDetailsContext';

export default function useAccountSocialDetails(): AccountSocialDetailsContextType {
  const context = useContext<AccountSocialDetailsContextType | null>(AccountSocialDetailsContext);

  if (!context) {
    throw new Error('useAccountSocialDetails must be used within AccountSocialDetailsProvider.');
  }

  return context;
}
