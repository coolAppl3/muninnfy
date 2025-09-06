import { JSX, ReactNode } from 'react';
import LoadingOverlayProvider from './providers/LoadingOverlayProvider';
import PopupMessageProvider from './providers/PopupMessageProvider';
import ConfirmModalProvider from './providers/ConfirmModalProvider';
import InfoModalProvider from './providers/InfoModalProvider';
import AuthSessionProvider from './providers/AuthSessionProvider';

export default function Providers({ children }: { children: ReactNode }): JSX.Element {
  return (
    <LoadingOverlayProvider>
      <PopupMessageProvider>
        <AuthSessionProvider>
          <ConfirmModalProvider>
            <InfoModalProvider>{children}</InfoModalProvider>
          </ConfirmModalProvider>
        </AuthSessionProvider>
      </PopupMessageProvider>
    </LoadingOverlayProvider>
  );
}
