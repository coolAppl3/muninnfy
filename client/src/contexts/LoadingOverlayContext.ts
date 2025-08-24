import { createContext } from 'react';

export interface LoadingOverlayContextInterface {
  displayLoadingOverlay: () => void;
  removeLoadingOverlay: () => void;
}

const LoadingOverlayContext = createContext<LoadingOverlayContextInterface | null>(null);
export default LoadingOverlayContext;
