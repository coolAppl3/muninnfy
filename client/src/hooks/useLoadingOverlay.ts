import { useContext } from 'react';
import LoadingOverlayContext, { LoadingOverlayContextInterface } from '../contexts/LoadingOverlayContext';

export default function useLoadingOverlay(): LoadingOverlayContextInterface {
  const context = useContext<LoadingOverlayContextInterface | null>(LoadingOverlayContext);

  if (!context) {
    throw new Error('useLoadingOverlay must be used within a LoadingOverlayProvider.');
  }

  return context;
}
