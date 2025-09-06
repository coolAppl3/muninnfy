import { JSX, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import HistoryContext from '../contexts/HistoryContext';
import { useLocation } from 'react-router-dom';

export default function HistoryProvider({ children }: { children: ReactNode }): JSX.Element {
  const { pathname } = useLocation();

  const [referrerPathname, setReferrerPathname] = useState<string | null>(pathname);
  const [postAuthRedirectPathname, setPostAuthRedirectPathname] = useState<string | null>(null);

  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    setReferrerPathname(prevPathRef.current);
    prevPathRef.current = pathname;
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
