import { JSX, ReactNode, useEffect, useState } from 'react';
import AuthContext from '../contexts/AuthContext';
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

  return <AuthContext.Provider value={{ isSignedIn, setIsSignedIn }}>{children}</AuthContext.Provider>;
}
