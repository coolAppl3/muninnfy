import { ChangeEventHandler, HTMLInputAutoCompleteAttribute, JSX } from 'react';
import './FormGroups.css';

interface DefaultFormGroupProps {
  id: string;
  label: string;
  autoComplete: HTMLInputAutoCompleteAttribute;
  value: string;
  errorMessage: string | null;
  onChange: ChangeEventHandler<HTMLInputElement>;
  className?: string;
}

export default function DefaultFormGroup({
  id,
  label,
  autoComplete,
  value,
  errorMessage,
  onChange,
  className,
}: DefaultFormGroupProps): JSX.Element {
  return (
    <div className={`form-group ${errorMessage ? 'error' : ''} ${className ? className : ''}`}>
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
