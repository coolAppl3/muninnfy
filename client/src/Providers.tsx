import { JSX, ReactNode } from 'react';
import LoadingOverlayProvider from './providers/LoadingOverlayProvider';
import PopupMessageProvider from './providers/PopupMessageProvider';

export default function Providers({ children }: { children: ReactNode }): JSX.Element {
  return (
    <LoadingOverlayProvider>
      <PopupMessageProvider>{children}</PopupMessageProvider>
    </LoadingOverlayProvider>
  );
}
