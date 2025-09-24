import { useContext } from 'react';
import InfoModalContext, { InfoModalContextType } from '../contexts/InfoModalContext';

export default function useInfoModal(): InfoModalContextType {
  const context = useContext<InfoModalContextType | null>(InfoModalContext);

  if (!context) {
    throw new Error('useInfoModal must be used within InfoModalContext.');
  }

  return context;
}
