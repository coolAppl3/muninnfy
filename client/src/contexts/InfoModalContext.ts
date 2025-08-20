import { createContext } from 'react';
import { InfoModalProps } from '../components/InfoModal/InfoModal';

export interface InfoModalContextInterface {
  displayInfoModal: (props: InfoModalProps) => void;
  removeInfoModal: () => void;
}

const InfoModalContext = createContext<InfoModalContextInterface | null>(null);
export default InfoModalContext;
