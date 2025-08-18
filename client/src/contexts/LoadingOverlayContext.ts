import { createContext, useContext, useState } from 'react';

export interface LoadingOverlayContextInterface {
  displayLoadingOverlay: () => void;
  hideLoadingOverlay: () => void;
  visible: boolean;
}

export const LoadingOverlayContext = createContext<LoadingOverlayContextInterface | null>(null);
