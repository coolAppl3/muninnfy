import { createContext } from 'react';

export type PopupMessageContextType = {
  displayPopupMessage: (message: string, type: 'success' | 'error') => void;
};

const PopupMessageContext = createContext<PopupMessageContextType | null>(null);
export default PopupMessageContext;
