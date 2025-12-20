import { JSX } from 'react';
import useAccountOngoingRequests from '../../../../hooks/useAccountOngoingRequests';
import { getDateAndTimeString } from '../../../../../../utils/globalUtils';
import Button from '../../../../../../components/Button/Button';
import useAccountProfile from '../../../../hooks/useAccountProfile';

export default function AccountChangeEmailSuspended(): JSX.Element {
  const { ongoingEmailUpdateRequest } = useAccountOngoingRequests();
  const { setProfileSection } = useAccountProfile();

  if (!ongoingEmailUpdateRequest) {
    return <></>;
  }

  return (
    <div>
      <h4 className='text-danger mb-1'>Email update request suspended.</h4>

      <p className='text-description text-sm mb-2'>
        The request has been suspended for 24 hours as a result of multiple failed attempts. You can try again after{' '}
        <span className='text-title font-medium'>{getDateAndTimeString(ongoingEmailUpdateRequest.expiry_timestamp)}</span>.
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
