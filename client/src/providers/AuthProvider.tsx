import { JSX, ReactNode, useCallback, useEffect, useState } from 'react';
import AuthContext from '../contexts/AuthContext';
import { checkForAuthSessionService, signOutService } from '../services/authServices';
import useLoadingOverlay from '../hooks/useLoadingOverlay';
import usePopupMessage from '../hooks/usePopupMessage';

export default function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);

  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();
  const { displayPopupMessage } = usePopupMessage();

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

  const signOut = useCallback(async (): Promise<void> => {
    displayLoadingOverlay();

    try {
      await signOutService();
      setIsSignedIn(false);

      displayPopupMessage('Signed out.', 'success');
    } catch (err: unknown) {
      console.log(err);
      displayPopupMessage('Sign out failed.', 'success');
    } finally {
      removeLoadingOverlay();
    }
  }, [displayLoadingOverlay, removeLoadingOverlay, displayPopupMessage]);

  return <AuthContext.Provider value={{ isSignedIn, setIsSignedIn, signOut }}>{children}</AuthContext.Provider>;
}
