import { useContext } from 'react';
import ViewModeContext, { ViewModeContextType } from '../contexts/ViewModeContext';

export default function useViewMode(): ViewModeContextType {
  const context = useContext<ViewModeContextType | null>(ViewModeContext);

  if (!context) {
    throw new Error('useViewMode must be used within ViewModeProvider.');
  }

  return context;
}
