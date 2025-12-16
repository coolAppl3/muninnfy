import { JSX, useState } from 'react';
import ToggleSwitch from '../../../../../components/ToggleSwitch/ToggleSwitch';
import Button from '../../../../../components/Button/Button';
import useAccountDetails from '../../../hooks/useAccountDetails';
import useLoadingOverlay from '../../../../../hooks/useLoadingOverlay';
import usePopupMessage from '../../../../../hooks/usePopupMessage';
import useHandleAsyncError, { HandleAsyncErrorFunction } from '../../../../../hooks/useHandleAsyncError';
import { updateAccountPrivacyService } from '../../../../../services/accountServices';
import useAccountProfile from '../../../contexts/useAccountProfile';

export default function AccountProfilePrivacy(): JSX.Element {
  const { setProfileSection } = useAccountProfile();

  const { accountDetails, setAccountDetails } = useAccountDetails();
  const { is_private, approve_follow_requests } = accountDetails;

  const [isPrivate, setIsPrivate] = useState<boolean>(is_private);
  const [approveFollowRequests, setApproveFollowRequests] = useState<boolean>(approve_follow_requests);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();
  const { displayPopupMessage } = usePopupMessage();
  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();

  const changesDetected: boolean = isPrivate !== is_private || approveFollowRequests !== approve_follow_requests;

  async function updateAccountPrivacy(): Promise<void> {
    try {
      await updateAccountPrivacyService({ isPrivate, approveFollowRequests });
      setAccountDetails((prev) => ({ ...prev, is_private: isPrivate, approve_follow_requests: approveFollowRequests }));

      displayPopupMessage('Privacy preferences updated.', 'success');
      setProfileSection(null);
    } catch (err: unknown) {
      console.log(err);
      handleAsyncError(err);
    }
  }

  return (
    <div className='grid gap-1'>
      <h3 className='text-md text-title font-normal'>Privacy settings</h3>

      <div className='grid gap-y-[4px] text-description text-sm font-medium'>
        <div className='flex justify-between items-center p-1 bg-dark rounded'>
          <p>Private account</p>
          <ToggleSwitch
            isToggled={isPrivate}
            onClick={() => {
              const nextValueIsPrivate: boolean = !isPrivate;

              nextValueIsPrivate && setApproveFollowRequests(true);
              setIsPrivate((prev) => !prev);
            }}
          />
        </div>

        <div className='flex justify-between items-center p-1 bg-dark rounded'>
          <p>Approve followers</p>
          <ToggleSwitch
            isToggled={approveFollowRequests}
            onClick={() => isPrivate || setApproveFollowRequests((prev) => !prev)}
            className={isPrivate ? '!brightness-50 !cursor-default' : ''}
          />
        </div>
      </div>

      <div className='flex flex-col sm:flex-row sm:justify-start items-center gap-1'>
        <Button
          className='bg-cta border-cta text-dark w-full sm:w-fit order-1 sm:order-2'
          disabled={!changesDetected}
          onClick={async () => {
            if (isSubmitting || !changesDetected) {
              return;
            }

            displayLoadingOverlay();
            setIsSubmitting(true);

            await updateAccountPrivacy();

            setIsSubmitting(false);
            removeLoadingOverlay();
          }}
        >
          Save
        </Button>

        <Button
          className='bg-secondary border-title text-title w-full sm:w-fit order-2 sm:order-1'
          onClick={() => {
            setIsPrivate(is_private);
            setApproveFollowRequests(approve_follow_requests);

            setProfileSection(null);
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
