import { JSX } from 'react';
import useAccountOngoingRequests from '../../../hooks/useAccountOngoingRequests';
import useAccountDetails from '../../../hooks/useAccountDetails';

export default function AccountChangeEmail(): JSX.Element {
  const { accountDetails, setAccountDetails } = useAccountDetails();
  const { ongoingEmailUpdateRequest, setOngoingEmailUpdateRequest } = useAccountOngoingRequests();

  return <></>;
}
