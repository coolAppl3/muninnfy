import { JSX, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import HistoryContext, { HistoryContextType } from '../contexts/HistoryContext';
import { useLocation } from 'react-router-dom';

type HistoryProviderProps = {
  children: ReactNode;
};

export default function HistoryProvider({ children }: HistoryProviderProps): JSX.Element {
  const [referrerLocation, setReferrerLocation] = useState<string | null>(null);
  const [postAuthNavigate, setPostAuthNavigate] = useState<string | null>(null);

  const { pathname, search } = useLocation();
  const locationRef = useRef<string>(pathname);

  useEffect(() => {
    if (pathname === '/wishlist/new') {
      if (!referrerLocation) {
        setReferrerLocation('/account');
      }
      return;
    }

    const location: string = pathname + search;

    if (location === locationRef.current) {
      return;
    }

    setReferrerLocation(locationRef.current);
    locationRef.current = location;
  }, [pathname, search]);

  const contextValue: HistoryContextType = useMemo(
    () => ({
      referrerLocation,
      setReferrerLocation,
      postAuthNavigate,
      setPostAuthNavigate,
    }),
    [referrerLocation, postAuthNavigate]
  );

  return <HistoryContext value={contextValue}>{children}</HistoryContext>;
}
