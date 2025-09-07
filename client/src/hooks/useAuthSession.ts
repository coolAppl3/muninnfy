import { useContext } from 'react';
import AuthSessionContext, { AuthSessionContextInterface } from '../contexts/AuthSessionContext';

export default function useAuthSession(): AuthSessionContextInterface {
  const context = useContext<AuthSessionContextInterface | null>(AuthSessionContext);

  if (!context) {
    throw new Error('useAuthSession must be used within AuthSessionProvider.');
  }

  return context;
}
