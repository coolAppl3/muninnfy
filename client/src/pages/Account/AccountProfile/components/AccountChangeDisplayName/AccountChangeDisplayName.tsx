import { ChangeEvent, FormEvent, JSX, useState } from 'react';
import Button from '../../../../../components/Button/Button';
import DefaultFormGroup from '../../../../../components/DefaultFormGroup/DefaultFormGroup';
import { validateDisplayName } from '../../../../../utils/validation/userValidation';
import useAccountDetails from '../../../hooks/useAccountDetails';
import useAccountProfile from '../../../hooks/useAccountProfile';
import useLoadingOverlay from '../../../../../hooks/useLoadingOverlay';
import usePopupMessage from '../../../../../hooks/usePopupMessage';
import { updateDisplayNameService } from '../../../../../services/accountServices';
import useHandleAsyncError, { HandleAsyncErrorFunction } from '../../../../../hooks/useHandleAsyncError';
import useAuth from '../../../../../hooks/useAuth';

export default function AccountChangeDisplayName(): JSX.Element {
  const { accountDetails, setAccountDetails } = useAccountDetails();
  const { setProfileSection, setIsSubmitting, isSubmitting } = useAccountProfile();

  const [value, setValue] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { setAuthStatus } = useAuth();
  const handleAsyncError: HandleAsyncErrorFunction = useHandleAsyncError();
  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();
  const { displayPopupMessage } = usePopupMessage();

  async function updateDisplayName(): Promise<void> {
    const newDisplayName: string = value;

    try {
      await updateDisplayNameService({ newDisplayName });
      setAccountDetails((prev) => ({ ...prev, display_name: newDisplayName }));

      displayPopupMessage('Display name changed.', 'success');
      setProfileSection(null);
    } catch (err: unknown) {
      console.log(err);
      const { isHandled, status, errMessage, errReason } = handleAsyncError(err);

      if (isHandled) {
        return;
      }

      if (status === 409 || (status === 400 && errReason)) {
        setErrorMessage(errMessage);
      }

      if (status === 404) {
        setAuthStatus('unauthenticated');
      }
    }
  }

  return (
    <form
      className='grid gap-2'
      onSubmit={async (e: FormEvent) => {
        e.preventDefault();

        if (isSubmitting) {
          return;
        }

        const newErrorMessage: string | null =
          value === accountDetails.display_name ? 'Account already has this display name.' : validateDisplayName(value);

        if (newErrorMessage) {
          setErrorMessage(newErrorMessage);
          displayPopupMessage(newErrorMessage, 'error');

          return;
        }

        setIsSubmitting(true);
        displayLoadingOverlay();

        await updateDisplayName();

        setIsSubmitting(false);
        removeLoadingOverlay();
      }}
    >
      <DefaultFormGroup
        id='new-display-name'
        label='New display name'
        autoComplete='name'
        value={value}
        errorMessage={errorMessage}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const newValue: string = e.target.value;

          setValue(newValue);
          setErrorMessage(
            newValue === accountDetails.display_name ? 'Account already has this display name.' : validateDisplayName(newValue)
          );
        }}
      />

      <div className='flex flex-col justify-start items-center gap-1 sm:flex-row'>
        <Button
          isSubmitBtn
          className='bg-cta border-cta order-1 sm:order-2 w-full sm:w-fit'
        >
          Submit
        </Button>

        <Button
          className='bg-secondary border-title text-title order-2 sm:order-1 w-full sm:w-fit'
          onClick={() => setProfileSection(null)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
