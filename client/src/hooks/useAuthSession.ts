import { useContext } from 'react';
import AuthSessionContext, { AuthSessionContextType } from '../contexts/AuthSessionContext';

export default function useAuthSession(): AuthSessionContextType {
  const context = useContext<AuthSessionContextType | null>(AuthSessionContext);

  if (!context) {
    throw new Error('useAuthSession must be used within AuthSessionProvider.');
  }

  return context;
}
