import { useContext } from 'react';
import LoadingOverlayContext, { LoadingOverlayContextType } from '../contexts/LoadingOverlayContext';

export default function useLoadingOverlay(): LoadingOverlayContextType {
  const context = useContext<LoadingOverlayContextType | null>(LoadingOverlayContext);

  if (!context) {
    throw new Error('useLoadingOverlay must be used within a LoadingOverlayProvider.');
  }

  return context;
}
