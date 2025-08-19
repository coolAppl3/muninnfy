import { useContext } from 'react';
import { LoadingOverlayContext, LoadingOverlayContextInterface } from '../contexts/LoadingOverlayContext';

export function useLoadingOverlay(): LoadingOverlayContextInterface {
  const context = useContext(LoadingOverlayContext);

  if (!context) {
    throw new Error('');
  }

  return context;
}
