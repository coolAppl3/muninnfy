import { useContext } from 'react';
import PopupMessageContext, { PopupMessageContextInterface } from '../contexts/PopupMessageContext';

export default function usePopupMessage(): PopupMessageContextInterface {
  const context = useContext<PopupMessageContextInterface | null>(PopupMessageContext);

  if (!context) {
    throw new Error('usePopupMessage must be used within a PopupMessageProvider.');
  }

  return context;
}
