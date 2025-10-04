import { ChangeEventHandler, JSX, useState } from 'react';
import EyeIcon from '../../assets/svg/EyeIcon.svg?react';
import EyeShutIcon from '../../assets/svg/EyeShutIcon.svg?react';

type PasswordFormGroupProps = {
  id: string;
  label: string;
  value: string;
  errorMessage: string | null;
  onChange: ChangeEventHandler<HTMLInputElement>;
  className?: string;
};

export default function PasswordFormGroup({ id, label, value, errorMessage, onChange, className }: PasswordFormGroupProps): JSX.Element {
  const [isPasswordType, setIsPasswordType] = useState<boolean>(true);

  function handleClick(): void {
    setIsPasswordType((prev) => !prev);
  }

  return (
    <div className={`flex flex-col justify-center items-start gap-[6px] ${className ? className : ''}`}>
      <label
        htmlFor={id}
        className='text-sm font-medium text-title'
      >
        {label}
      </label>

      <div className='relative w-full'>
        <input
          type={isPasswordType ? 'password' : 'text'}
          name={id}
          id={id}
          autoComplete='current-password'
          value={value}
          onChange={onChange}
          className={`w-full h-4 p-1 rounded border-1 focus:!border-cta outline-0 text-description font-medium md:text-sm transition-colors ${
            errorMessage ? 'border-danger' : 'border-description/70'
          }`}
        />

        <button
          type='button'
          onClick={handleClick}
          title={`${isPasswordType ? 'Reveal' : 'Hide'} password`}
          aria-label={`${isPasswordType ? 'Reveal' : 'Hide'} password`}
          className='absolute right-0 top-0 bottom-0 my-auto cursor-pointer p-1 transition-colors text-description hover:text-cta'
        >
          {isPasswordType ? <EyeIcon className='w-2 h-2' /> : <EyeShutIcon className='w-2 h-2' />}
        </button>
      </div>

      <span className={`text-[12px] font-medium text-danger leading-[1.2] break-words ${errorMessage ? 'block' : 'hidden'}`}>
        {errorMessage}
      </span>
    </div>
  );
}
