import { JSX, useCallback, useMemo, useState } from 'react';
import LoadingOverlayContext, { LoadingOverlayContextInterface } from '../contexts/LoadingOverlayContext';

export default function LoadingOverlayProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [visible, setVisible] = useState<boolean>(false);

  const displayLoadingOverlay = useCallback(() => setVisible(true), []);
  const removeLoadingOverlay = useCallback(() => setVisible(false), []);

  const contextValue: LoadingOverlayContextInterface = useMemo(
    () => ({ displayLoadingOverlay, removeLoadingOverlay }),
    [displayLoadingOverlay, removeLoadingOverlay]
  );

  return (
    <LoadingOverlayContext.Provider value={contextValue}>
      {children}

      {visible && (
        <div className='fixed top-0 left-0 w-full h-[100vh] bg-overlay z-30 grid place-items-center'>
          <div className='spinner w-3 h-3'></div>
        </div>
      )}
    </LoadingOverlayContext.Provider>
  );
}
