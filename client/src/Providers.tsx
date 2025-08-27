import { JSX, ReactNode } from 'react';
import LoadingOverlayProvider from './providers/LoadingOverlayProvider';
import PopupMessageProvider from './providers/PopupMessageProvider';
import ConfirmModalProvider from './providers/ConfirmModalProvider';
import InfoModalProvider from './providers/InfoModalProvider';
import AuthProvider from './providers/AuthProvider';

export default function Providers({ children }: { children: ReactNode }): JSX.Element {
  return (
    <AuthProvider>
      <LoadingOverlayProvider>
        <PopupMessageProvider>
          <ConfirmModalProvider>
            <InfoModalProvider>{children}</InfoModalProvider>
          </ConfirmModalProvider>
        </PopupMessageProvider>
      </LoadingOverlayProvider>
    </AuthProvider>
  );
}
