import { createContext } from 'react';

export interface LoadingOverlayContextInterface {
  displayLoadingOverlay: () => void;
  hideLoadingOverlay: () => void;
}

const LoadingOverlayContext = createContext<LoadingOverlayContextInterface | null>(null);
export default LoadingOverlayContext;
