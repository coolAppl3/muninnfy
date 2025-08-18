import { JSX, ReactNode } from 'react';
import LoadingOverlayProvider from './providers/LoadingOverlayProvider';

export default function Providers({ children }: { children: ReactNode }): JSX.Element {
  return <LoadingOverlayProvider>{children} </LoadingOverlayProvider>;
}
