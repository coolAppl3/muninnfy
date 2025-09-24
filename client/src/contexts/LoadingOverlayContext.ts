import { createContext } from 'react';

export type LoadingOverlayContextType = {
  displayLoadingOverlay: () => void;
  removeLoadingOverlay: () => void;
};

const LoadingOverlayContext = createContext<LoadingOverlayContextType | null>(null);
export default LoadingOverlayContext;
