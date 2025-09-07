import { useContext } from 'react';
import AuthContext, { AuthContextInterface } from '../contexts/AuthContext';

export default function useAuth(): AuthContextInterface {
  const context = useContext<AuthContextInterface | null>(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
}
