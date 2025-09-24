import { JSX, ReactNode, useCallback, useMemo } from 'react';
import AuthSessionContext, { AuthSessionContextType } from '../contexts/AuthSessionContext';
import useAuth from '../hooks/useAuth';
import useLoadingOverlay from '../hooks/useLoadingOverlay';
import usePopupMessage from '../hooks/usePopupMessage';
import { signOutService } from '../services/authServices';

export default function AuthSessionProvider({ children }: { children: ReactNode }): JSX.Element {
  const { setAuthStatus } = useAuth();
  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();
  const { displayPopupMessage } = usePopupMessage();

  const signOut = useCallback(async (): Promise<void> => {
    displayLoadingOverlay();

    try {
      await signOutService();
      setAuthStatus('unauthenticated');

      displayPopupMessage('Signed out', 'success');
    } catch (err: unknown) {
      console.log(err);
      displayPopupMessage('Failed to sign out.', 'error');
    } finally {
      removeLoadingOverlay();
    }
  }, [setAuthStatus, displayLoadingOverlay, removeLoadingOverlay, displayPopupMessage]);

  const contextValue: AuthSessionContextType = useMemo(() => ({ signOut }), [signOut]);
  return <AuthSessionContext.Provider value={contextValue}>{children}</AuthSessionContext.Provider>;
}
