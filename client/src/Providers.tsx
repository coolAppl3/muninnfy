import { JSX, ReactNode } from 'react';
import LoadingOverlayProvider from './providers/LoadingOverlayProvider';
import PopupMessageProvider from './providers/PopupMessageProvider';
import ConfirmModalProvider from './providers/ConfirmModalProvider';

export default function Providers({ children }: { children: ReactNode }): JSX.Element {
  return (
    <LoadingOverlayProvider>
      <PopupMessageProvider>
        <ConfirmModalProvider>{children}</ConfirmModalProvider>
      </PopupMessageProvider>
    </LoadingOverlayProvider>
  );
}
