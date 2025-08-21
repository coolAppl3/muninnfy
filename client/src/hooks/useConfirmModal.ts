import { useContext } from 'react';
import ConfirmModalContext, { ConfirmModalContextInterface } from '../contexts/ConfirmModalContext';

export default function useConfirmModal(): ConfirmModalContextInterface {
  const context = useContext<ConfirmModalContextInterface | null>(ConfirmModalContext);

  if (!context) {
    throw new Error('useConfirmModal must be used within a ConfirmModalProvider.');
  }

  return context;
}
