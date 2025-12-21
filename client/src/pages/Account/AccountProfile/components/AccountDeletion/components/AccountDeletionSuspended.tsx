import { JSX } from 'react';
import useAccountOngoingRequests from '../../../../hooks/useAccountOngoingRequests';
import { getDateAndTimeString } from '../../../../../../utils/globalUtils';
import Button from '../../../../../../components/Button/Button';
import useAccountProfile from '../../../../hooks/useAccountProfile';

export default function AccountDeletionSuspended(): JSX.Element {
  const { ongoingAccountDeletionRequest } = useAccountOngoingRequests();
  const { setProfileSection } = useAccountProfile();

  if (!ongoingAccountDeletionRequest) {
    return <></>;
  }

  return (
    <div>
      <h4 className='text-danger mb-1'>Deletion request suspended.</h4>

      <p className='text-description text-sm mb-2 max-w-4/5'>
        The request has been suspended for 24 hours as a result of multiple failed attempts. You can try again after{' '}
        <span className='text-title font-medium'>{getDateAndTimeString(ongoingAccountDeletionRequest.expiry_timestamp)}</span>.
      </p>

      <Button
        className='bg-description border-description text-dark'
        onClick={() => {
          setProfileSection(null);
        }}
      >
        Close
      </Button>
    </div>
  );
}
