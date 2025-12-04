import { useContext } from 'react';
import AccountLocationContext, { AccountLocationContextType } from '../contexts/AccountLocationContext';

export default function useAccountLocation(): AccountLocationContextType {
  const context = useContext<AccountLocationContextType | null>(AccountLocationContext);

  if (!context) {
    throw new Error('useAccountLocation must be used within AccountLocationProvider.');
  }

  return context;
}
