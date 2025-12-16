import { JSX, ReactNode, useMemo, useState } from 'react';
import AccountContext, { AccountDetailsContextType } from '../contexts/AccountDetailsContext';
import { AccountDetailsType, OngoingAccountRequest } from '../../../types/accountTypes';

type AccountDetailsProviderProps = {
  initialAccountDetails: AccountDetailsType;
  children: ReactNode;
};

export default function AccountDetailsProvider({ initialAccountDetails, children }: AccountDetailsProviderProps): JSX.Element {
  const [accountDetails, setAccountDetails] = useState<AccountDetailsType>(initialAccountDetails);
  const [ongoingEmailUpdateRequest, setOngoingEmailUpdateRequest] = useState<(OngoingAccountRequest & { new_email: string }) | null>(null);
  const [ongoingAccountDeletionRequest, setOngoingAccountDeletionRequest] = useState<OngoingAccountRequest | null>(null);

  const contextValue: AccountDetailsContextType = useMemo(
    () => ({
      accountDetails,
      setAccountDetails,

      ongoingEmailUpdateRequest,
      setOngoingEmailUpdateRequest,

      ongoingAccountDeletionRequest,
      setOngoingAccountDeletionRequest,
    }),
    [accountDetails, ongoingEmailUpdateRequest, ongoingAccountDeletionRequest]
  );

  return <AccountContext value={contextValue}>{children}</AccountContext>;
}
