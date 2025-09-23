import { createContext } from 'react';
import { InfoModalProps } from '../components/InfoModal/InfoModal';

export type InfoModalContextType = {
  displayInfoModal: (props: InfoModalProps) => void;
  removeInfoModal: () => void;
};

const InfoModalContext = createContext<InfoModalContextType | null>(null);
export default InfoModalContext;
