import { JSX, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import HistoryContext from '../contexts/HistoryContext';
import { useLocation } from 'react-router-dom';

export default function HistoryProvider({ children }: { children: ReactNode }): JSX.Element {
  const [referrerPathname, setReferrerPathname] = useState<string | null>(null);
  const [postAuthRedirectPathname, setPostAuthRedirectPathname] = useState<string | null>(null);

  const { pathname } = useLocation();
  const pathnameRef = useRef<string>(pathname);

  useEffect(() => {
    if (pathname === pathnameRef.current) {
      return;
    }

    setReferrerPathname(pathnameRef.current);
    pathnameRef.current = pathname;
  }, [pathname]);

  const contextValue = useMemo(
    () => ({
      referrerPathname,
      setReferrerPathname,
      postAuthRedirectPathname,
      setPostAuthRedirectPathname,
    }),
    [referrerPathname, postAuthRedirectPathname]
  );

  return <HistoryContext value={contextValue}>{children}</HistoryContext>;
}
