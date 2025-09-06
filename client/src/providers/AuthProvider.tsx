import { JSX, ReactNode, useEffect, useMemo, useState } from 'react';
import AuthContext, { AuthContextInterface } from '../contexts/AuthContext';
import { checkForAuthSessionService } from '../services/authServices';

export default function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);

  useEffect(() => {
    const abortController: AbortController = new AbortController();

    const checkForAuthSession = async (): Promise<void> => {
      try {
        const isValidAuthSession: boolean = (await checkForAuthSessionService(abortController.signal)).data.isValidAuthSession;
        setIsSignedIn(isValidAuthSession);
      } catch (err: unknown) {
        setIsSignedIn(false);
      }
    };

    checkForAuthSession();

    return () => {
      abortController.abort();
    };
  }, []);

  const contextValue: AuthContextInterface = useMemo(() => ({ isSignedIn, setIsSignedIn }), [isSignedIn]);
  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
