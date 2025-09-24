import { useContext } from 'react';
import PopupMessageContext, { PopupMessageContextType } from '../contexts/PopupMessageContext';

export default function usePopupMessage(): PopupMessageContextType {
  const context = useContext<PopupMessageContextType | null>(PopupMessageContext);

  if (!context) {
    throw new Error('usePopupMessage must be used within a PopupMessageProvider.');
  }

  return context;
}
