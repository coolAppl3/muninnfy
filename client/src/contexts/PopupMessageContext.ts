import { createContext } from 'react';

export interface PopupMessageContextInterface {
  displayPopupMessage: (message: string, type: 'success' | 'error') => void;
}

export const PopupMessageContext = createContext<PopupMessageContextInterface | null>(null);
