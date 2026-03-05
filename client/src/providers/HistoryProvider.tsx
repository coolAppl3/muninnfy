import { JSX, ReactNode, useMemo, useRef, useState } from 'react';
import HistoryContext, { HistoryContextType } from '../contexts/HistoryContext';
import { useLocation } from 'react-router-dom';

type HistoryProviderProps = {
  children: ReactNode;
};

export default function HistoryProvider({ children }: HistoryProviderProps): JSX.Element {
  const [postAuthNavigate, setPostAuthNavigate] = useState<string | null>(null);
  const { pathname, search } = useLocation();

  const currentLocation: string = pathname + search;

  const currentLocationRef = useRef<string>(currentLocation);
  const referrerLocationRef = useRef<string | null>(null);

  if (
    currentLocation !== currentLocationRef.current &&
    pathname !== '/wishlist/new' /** avoids awkward/confusing navigation post wishlist creation*/
  ) {
    referrerLocationRef.current = currentLocationRef.current;
    currentLocationRef.current = currentLocation;
  }

  const contextValue: HistoryContextType = useMemo(
    () => ({
      referrerLocation: referrerLocationRef.current,
      setReferrerLocation: (newReferrerLocation: string | null) => {
        referrerLocationRef.current = newReferrerLocation;
      },
      postAuthNavigate,
      setPostAuthNavigate,
    }),
    // eslint-disable-next-line
    [postAuthNavigate, currentLocation]
  );

  return <HistoryContext value={contextValue}>{children}</HistoryContext>;
}
