import { JSX, useCallback, useEffect, useMemo, useState } from 'react';
import LoadingOverlayContext, { LoadingOverlayContextType } from '../contexts/LoadingOverlayContext';
import { Location, useLocation } from 'react-router-dom';

export default function LoadingOverlayProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const routerLocation: Location = useLocation();

  const displayLoadingOverlay = useCallback(() => setIsVisible(true), []);
  const removeLoadingOverlay = useCallback(() => setIsVisible(false), []);

  const contextValue: LoadingOverlayContextType = useMemo(
    () => ({ displayLoadingOverlay, removeLoadingOverlay }),
    [displayLoadingOverlay, removeLoadingOverlay]
  );

  useEffect(() => {
    return () => setIsVisible(false);
  }, [routerLocation]);

  return (
    <LoadingOverlayContext.Provider value={contextValue}>
      {children}

      {isVisible && (
        <div className='fixed top-0 left-0 w-full h-[100vh] bg-overlay z-30 grid place-items-center'>
          <div className='spinner w-3 h-3'></div>
        </div>
      )}
    </LoadingOverlayContext.Provider>
  );
}
