import { useContext } from 'react';
import ConfirmModalContext, { ConfirmModalContextType } from '../contexts/ConfirmModalContext';

export default function useConfirmModal(): ConfirmModalContextType {
  const context = useContext<ConfirmModalContextType | null>(ConfirmModalContext);

  if (!context) {
    throw new Error('useConfirmModal must be used within a ConfirmModalProvider.');
  }

  return context;
}
