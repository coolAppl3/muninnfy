import { JSX, useState } from 'react';
import LoadingOverlayContext from '../contexts/LoadingOverlayContext';

export default function LoadingOverlayProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [visible, setVisible] = useState(false);

  const displayLoadingOverlay = () => setVisible(true);
  const removeLoadingOverlay = () => setVisible(false);

  return (
    <LoadingOverlayContext.Provider value={{ displayLoadingOverlay, removeLoadingOverlay }}>
      {children}

      {visible && (
        <div className='fixed top-0 left-0 w-full h-[100vh] bg-overlay z-30 grid place-items-center'>
          <div className='spinner w-3 h-3'></div>
        </div>
      )}
    </LoadingOverlayContext.Provider>
  );
}
