import { useContext } from 'react';
import HistoryContext, { HistoryContextType } from '../contexts/HistoryContext';

export default function useHistory(): HistoryContextType {
  const context = useContext<HistoryContextType | null>(HistoryContext);

  if (!context) {
    throw new Error('useHistory must be used within HistoryContext.');
  }

  return context;
}
