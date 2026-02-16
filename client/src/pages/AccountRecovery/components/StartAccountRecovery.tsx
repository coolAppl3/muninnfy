import { ChangeEvent, FormEvent, JSX, useState } from 'react';
import { validateEmail } from '../../../utils/validation/userValidation';
import Button from '../../../components/Button/Button';
import DefaultFormGroup from '../../../components/DefaultFormGroup/DefaultFormGroup';
import usePopupMessage from '../../../hooks/usePopupMessage';

export default function StartAccountRecovery(): JSX.Element {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [value, setValue] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { displayPopupMessage } = usePopupMessage();

  return (
    <>
      <h1 className='text-title text-xl 3xs:text-2xl font-bold mb-1'>Account Recovery</h1>
      <p className='text-description text-sm mb-[1.6rem]'>Enter your account's email address to start the recovery process.</p>

      <form
        onSubmit={async (e: FormEvent) => {
          e.preventDefault();

          if (isSubmitting) {
            return;
          }

          const newErrorMessage: string | null = validateEmail(value);
          if (newErrorMessage) {
            setErrorMessage(newErrorMessage);
            displayPopupMessage(newErrorMessage, 'error');

            return;
          }

          // TODO: continue implementation
        }}
      >
        <DefaultFormGroup
          id='email'
          label='Email address'
          value={value}
          autoComplete='email'
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const newValue: string = e.target.value;

            setValue(newValue);
            setErrorMessage(validateEmail(newValue));
          }}
          errorMessage={errorMessage}
        />

        <Button
          isSubmitBtn
          className='bg-cta border-cta w-full mt-2'
        >
          Continue
        </Button>
      </form>
    </>
  );
}
