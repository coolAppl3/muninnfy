import { JSX, ReactNode, useEffect, useMemo, useState } from 'react';
import AuthContext, { AuthContextType, AuthStatus } from '../contexts/AuthContext';
import { checkForAuthSessionService } from '../services/authServices';

export default function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    const abortController: AbortController = new AbortController();

    const checkForAuthSession = async (): Promise<void> => {
      try {
        const isValidAuthSession: boolean = (await checkForAuthSessionService(abortController.signal)).data.isValidAuthSession;
        setAuthStatus(isValidAuthSession ? 'authenticated' : 'unauthenticated');
      } catch (err: unknown) {
        setAuthStatus('unauthenticated');
      }
    };

    checkForAuthSession();

    return () => {
      abortController.abort();
    };
  }, []);

  const contextValue: AuthContextType = useMemo(() => ({ authStatus, setAuthStatus }), [authStatus]);
  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
