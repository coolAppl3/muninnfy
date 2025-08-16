import { ChangeEventHandler, HTMLInputAutoCompleteAttribute, JSX, useState } from 'react';
import EyeIcon from '../../assets/svg/EyeIcon.svg?react';
import './FormGroups.css';

interface DefaultFormGroupProps {
  id: string;
  label: string;
  autoComplete: HTMLInputAutoCompleteAttribute;
  value: string;
  errorMessage: string | null;
  onChange: ChangeEventHandler<HTMLInputElement>;
}

export function DefaultFormGroup({ id, label, autoComplete, value, errorMessage, onChange }: DefaultFormGroupProps): JSX.Element {
  return (
    <div className={`form-group ${errorMessage ? 'error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <input
        type='text'
        name={id}
        id={id}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
      />

      <span className='error-span'>{errorMessage}</span>
    </div>
  );
}

interface PasswordFormGroupProps {
  id: string;
  label: string;
  value: string;
  errorMessage: string | null;
  onChange: ChangeEventHandler<HTMLInputElement>;
}

export function PasswordFormGroup({ id, label, value, errorMessage, onChange }: PasswordFormGroupProps): JSX.Element {
  const [isPasswordType, setIsPasswordType] = useState<boolean>(true);

  function handleClick(): void {
    setIsPasswordType((prev) => !prev);
  }

  return (
    <div className={`form-group ${errorMessage ? 'error' : ''}`}>
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
          title={`${isPasswordType ? 'Reveal' : 'Hide'} password.`}
          aria-label={`${isPasswordType ? 'Reveal' : 'Hide'} password.`}
        >
          <EyeIcon />
        </button>
      </div>

      <span className='error-span'>{errorMessage}</span>
    </div>
  );
}
