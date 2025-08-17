import { JSX, ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }): JSX.Element {
  return <>{children}</>;
}
