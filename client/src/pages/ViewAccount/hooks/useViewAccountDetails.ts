import { useContext } from 'react';
import ViewAccountDetailsContext, {
  ViewAccountDetailsContextType,
} from '../contexts/ViewAccountDetailsContext';

export function useViewAccountDetails(): ViewAccountDetailsContextType {
  const context = useContext<ViewAccountDetailsContextType | null>(ViewAccountDetailsContext);

  if (!context) {
    throw new Error('useViewAccountDetails must be used within ViewAccountDetailsProvider.');
  }

  return context;
}
