import { JSX, ReactNode, useEffect, useState } from 'react';
import HistoryContext from '../contexts/HistoryContext';
import { useLocation } from 'react-router-dom';

export default function HistoryProvider({ children }: { children: ReactNode }): JSX.Element {
  const [referrerPathname, setReferrerPathname] = useState<string | null>(null);
  const [postAuthRedirectPathname, setPostAuthRedirectPathname] = useState<string | null>(null);

  const { pathname } = useLocation();

  useEffect(() => {
    setReferrerPathname(pathname);
  }, [pathname]);

  return (
    <HistoryContext value={{ referrerPathname, setReferrerPathname, postAuthRedirectPathname, setPostAuthRedirectPathname }}>
      {children}
    </HistoryContext>
  );
}
