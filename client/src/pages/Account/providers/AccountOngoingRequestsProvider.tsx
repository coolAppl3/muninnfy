import { JSX, ReactNode, useMemo, useState } from 'react';
import AccountOngoingRequestsContext, { AccountOngoingRequestsContextType } from '../contexts/AccountOngoingRequestsContext';
import { OngoingAccountRequest } from '../../../types/accountTypes';

type AccountOngoingRequestsProviderProps = {
  initialOngoingEmailUpdateRequest: (OngoingAccountRequest & { new_email: string }) | null;
  initialOngoingAccountDeletionRequest: OngoingAccountRequest | null;
  children: ReactNode;
};

export default function AccountOngoingRequestsProvider({
  initialOngoingEmailUpdateRequest,
  initialOngoingAccountDeletionRequest,
  children,
}: AccountOngoingRequestsProviderProps): JSX.Element {
  const [ongoingEmailUpdateRequest, setOngoingEmailUpdateRequest] = useState<(OngoingAccountRequest & { new_email: string }) | null>(
    initialOngoingEmailUpdateRequest
  );

  const [ongoingAccountDeletionRequest, setOngoingAccountDeletionRequest] = useState<OngoingAccountRequest | null>(
    initialOngoingAccountDeletionRequest
  );

  const contextValue: AccountOngoingRequestsContextType = useMemo(
    () => ({
      ongoingEmailUpdateRequest,
      setOngoingEmailUpdateRequest,

      ongoingAccountDeletionRequest,
      setOngoingAccountDeletionRequest,
    }),
    [ongoingEmailUpdateRequest, ongoingAccountDeletionRequest]
  );

  return <AccountOngoingRequestsContext value={contextValue}>{children}</AccountOngoingRequestsContext>;
}
