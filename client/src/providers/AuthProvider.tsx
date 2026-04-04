import { JSX, ReactNode, useEffect, useMemo, useState } from 'react';
import AuthContext, { AuthContextType, AuthStatus } from '../contexts/AuthContext';
import { checkForAuthSessionService } from '../services/authServices';
import { CanceledError } from 'axios';
import {
  connectAccountNotificationsWebSocket,
  disconnectAccountNotificationsWebSocket,
} from '../services/websockets/accountNotificationsWebsSocket';

type AuthProviderProps = {
  children: ReactNode;
};

export default function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    const abortController: AbortController = new AbortController();

    const checkForAuthSession = async () => {
      try {
        const isValidAuthSession: boolean = (
          await checkForAuthSessionService(abortController.signal)
        ).data.isValidAuthSession;
        setAuthStatus(isValidAuthSession ? 'authenticated' : 'unauthenticated');

        if (isValidAuthSession) {
          connectAccountNotificationsWebSocket();
        }
      } catch (err: unknown) {
        if (err instanceof CanceledError) {
          return;
        }

        setAuthStatus('unauthenticated');
      }
    };

    checkForAuthSession();
    return () => abortController.abort();
  }, []);

  useEffect(() => {
    if (authStatus === 'authenticated') {
      connectAccountNotificationsWebSocket();
      return;
    }

    if (authStatus === 'unauthenticated') {
      disconnectAccountNotificationsWebSocket();
    }
  }, [authStatus]);

  const contextValue: AuthContextType = useMemo(
    () => ({ authStatus, setAuthStatus }),
    [authStatus]
  );
  return <AuthContext value={contextValue}>{children}</AuthContext>;
}
