import { useContext } from 'react';
import HistoryContext, { HistoryContextInterface } from '../contexts/HistoryContext';

export default function useHistory(): HistoryContextInterface {
  const context = useContext<HistoryContextInterface | null>(HistoryContext);

  if (!context) {
    throw new Error('useHistory must be used within HistoryContext');
  }

  return context;
}
