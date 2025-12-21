import { useContext } from 'react';
import AccountOngoingRequestsContext, { AccountOngoingRequestsContextType } from '../contexts/AccountOngoingRequestsContext';

export default function useAccountOngoingRequests(): AccountOngoingRequestsContextType {
  const context = useContext<AccountOngoingRequestsContextType | null>(AccountOngoingRequestsContext);

  if (!context) {
    throw new Error('useAccountOngoingRequest must be used within AccountOngoingRequestsProvider.');
  }

  return context;
}
