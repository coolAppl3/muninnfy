import { createContext } from 'react';
import { ConfirmModalProps } from '../components/ConfirmModal/ConfirmModal';

export interface ConfirmModalContextInterface {
  displayConfirmModal: (props: ConfirmModalProps) => void;
  removeConfirmModal: () => void;
}

const ConfirmModalContext = createContext<ConfirmModalContextInterface | null>(null);
export default ConfirmModalContext;
