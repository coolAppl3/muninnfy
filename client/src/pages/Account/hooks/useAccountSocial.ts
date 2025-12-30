import { useContext } from 'react';
import AccountSocialContext, { AccountSocialContextType } from '../contexts/AccountSocialContext';

export default function useAccountSocial(): AccountSocialContextType {
  const context = useContext<AccountSocialContextType | null>(AccountSocialContext);

  if (!context) {
    throw new Error('useAccountSocial must be used within AccountSocialProvider.');
  }

  return context;
}
