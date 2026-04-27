import { useContext } from 'react';
import PopupMessageContext, {
  DisplayPopupMessageFunction,
} from '../contexts/PopupMessageContext';

export default function usePopupMessage(): DisplayPopupMessageFunction {
  const context = useContext<DisplayPopupMessageFunction | null>(PopupMessageContext);

  if (!context) {
    throw new Error('usePopupMessage must be used within a PopupMessageProvider.');
  }

  return context;
}
