import { createContext } from 'react';

export interface PopupMessageContextInterface {
  displayPopupMessage: (message: string, type: 'success' | 'error') => void;
}

const PopupMessageContext = createContext<PopupMessageContextInterface | null>(null);
export default PopupMessageContext;
