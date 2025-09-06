import { JSX, ReactNode } from 'react';
import LoadingOverlayProvider from './providers/LoadingOverlayProvider';
import PopupMessageProvider from './providers/PopupMessageProvider';
import ConfirmModalProvider from './providers/ConfirmModalProvider';
import InfoModalProvider from './providers/InfoModalProvider';
import AuthProvider from './providers/AuthProvider';
import HistoryProvider from './providers/HistoryProvider';

export default function Providers({ children }: { children: ReactNode }): JSX.Element {
  return (
    <LoadingOverlayProvider>
      <PopupMessageProvider>
        <AuthProvider>
          <HistoryProvider>
            <ConfirmModalProvider>
              <InfoModalProvider>{children}</InfoModalProvider>
            </ConfirmModalProvider>
          </HistoryProvider>
        </AuthProvider>
      </PopupMessageProvider>
    </LoadingOverlayProvider>
  );
}
