import { createContext } from 'react';

export type DisplayPopupMessageFunction = (message: string, type: 'success' | 'error') => void;

const PopupMessageContext = createContext<DisplayPopupMessageFunction | null>(null);
export default PopupMessageContext;
