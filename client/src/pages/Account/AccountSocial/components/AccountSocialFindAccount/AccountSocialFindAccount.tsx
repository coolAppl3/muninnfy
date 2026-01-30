import { ChangeEvent, FormEvent, JSX, useState } from 'react';
import DefaultFormGroup from '../../../../../components/DefaultFormGroup/DefaultFormGroup';
import { validateSocialFindQuery } from '../../../../../utils/validation/socialValidation';
import Button from '../../../../../components/Button/Button';

export default function AccountSocialFindAccount(): JSX.Element {
  const [value, setValue] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
      }}
    >
      <div className='h-line my-1'></div>

      <DefaultFormGroup
        id='find-users'
        label='Find users'
        autoComplete='off'
        placeholder='Username or account ID'
        className='mb-2'
        value={value}
        errorMessage={errorMessage}
        onChange={async (e: ChangeEvent<HTMLInputElement>) => {
          const newValue: string = e.target.value;
          const newErrorMessage: string | null = validateSocialFindQuery(newValue);

          setValue(newValue);
          setErrorMessage(newErrorMessage);
        }}
      />

      <div className='flex flex-col justify-start items-center gap-1 sm:flex-row'>
        <Button
          isSubmitBtn
          className='bg-cta border-cta order-1 sm:order-2 w-full sm:w-fit'
        >
          Search
        </Button>

        <Button
          className='bg-secondary border-title text-title order-2 sm:order-1 w-full sm:w-fit'
          onClick={() => {
            setValue('');
            setErrorMessage(null);
          }}
        >
          Clear
        </Button>
      </div>

      {/* TODO: continue implementation */}
    </form>
  );
}
