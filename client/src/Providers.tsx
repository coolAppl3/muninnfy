import { JSX, ReactNode } from 'react';
import LoadingOverlayProvider from './providers/LoadingOverlayProvider';
import PopupMessageProvider from './providers/PopupMessageProvider';
import ConfirmModalProvider from './providers/ConfirmModalProvider';
import InfoModalProvider from './providers/InfoModalProvider';
import AuthProvider from './providers/AuthProvider';
import HistoryProvider from './providers/HistoryProvider';

export default function Providers({ children }: { children: ReactNode }): JSX.Element {
  return (
    <AuthProvider>
      <HistoryProvider>
        <LoadingOverlayProvider>
          <PopupMessageProvider>
            <ConfirmModalProvider>
              <InfoModalProvider>{children}</InfoModalProvider>
            </ConfirmModalProvider>
          </PopupMessageProvider>
        </LoadingOverlayProvider>
      </HistoryProvider>
    </AuthProvider>
  );
}
