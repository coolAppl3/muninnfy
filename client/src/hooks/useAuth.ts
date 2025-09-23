import { useContext } from 'react';
import AuthContext, { AuthContextType } from '../contexts/AuthContext';

export default function useAuth(): AuthContextType {
  const context = useContext<AuthContextType | null>(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
}
