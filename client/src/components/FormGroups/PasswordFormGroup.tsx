import { ChangeEventHandler, JSX, useState } from 'react';
import EyeIcon from '../../assets/svg/EyeIcon.svg?react';
import EyeShutIcon from '../../assets/svg/EyeShutIcon.svg?react';
import './FormGroups.css';

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
    <div className={`form-group ${errorMessage ? 'error' : ''} ${className ? className : ''}`}>
      <label htmlFor={id}>{label}</label>
      <div className='password-input-container'>
        <input
          type={isPasswordType ? 'password' : 'text'}
          name={id}
          id={id}
          autoComplete='current-password'
          value={value}
          onChange={onChange}
        />

        <button
          type='button'
          onClick={handleClick}
          title={`${isPasswordType ? 'Reveal' : 'Hide'} password`}
          aria-label={`${isPasswordType ? 'Reveal' : 'Hide'} password`}
        >
          {isPasswordType ? <EyeIcon /> : <EyeShutIcon />}
        </button>
      </div>

      <span className='error-span'>{errorMessage}</span>
    </div>
  );
}
