import { JSX, ReactNode, useEffect, useState } from 'react';
import AuthContext from '../contexts/AuthContext';
import { getAuthSession } from '../services/authServices';

export default function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);

  useEffect(() => {
    const checkForAuthSession = async (): Promise<void> => {
      try {
        await getAuthSession();
        setIsSignedIn(true);
      } catch (err: unknown) {
        setIsSignedIn(false);
      }
    };

    checkForAuthSession();
  }, []);

  return <AuthContext.Provider value={{ isSignedIn, setIsSignedIn }}>{children}</AuthContext.Provider>;
}
