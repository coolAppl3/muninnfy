import { createContext } from 'react';
import { ConfirmModalProps } from '../components/ConfirmModal/ConfirmModal';

export type ConfirmModalContextType = {
  displayConfirmModal: (props: ConfirmModalProps) => void;
  removeConfirmModal: () => void;
};

const ConfirmModalContext = createContext<ConfirmModalContextType | null>(null);
export default ConfirmModalContext;
