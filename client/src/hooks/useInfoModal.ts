import { useContext } from 'react';
import InfoModalContext, { InfoModalContextInterface } from '../contexts/InfoModalContext';

export default function useInfoModal(): InfoModalContextInterface {
  const context = useContext<InfoModalContextInterface | null>(InfoModalContext);

  if (!context) {
    throw new Error('useInfoModal must be used within InfoModalContext.');
  }

  return context;
}
