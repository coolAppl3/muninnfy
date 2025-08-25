import { JSX, MouseEventHandler } from 'react';
import './FormGroups.css';
import CheckIcon from '../../assets/svg/CheckIcon.svg?react';

interface CheckboxFormGroupProps {
  label: string;
  id: string;
  isChecked: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

export default function CheckboxFormGroup({ label, id, isChecked, onClick }: CheckboxFormGroupProps): JSX.Element {
  return (
    <div className={`checkbox-form-group ${isChecked ? 'checked' : ''}`}>
      <button
        type='button'
        aria-label={isChecked ? 'Checked.' : 'Unchecked.'}
        id={id}
        onClick={onClick}
      >
        <CheckIcon />
      </button>

      <label htmlFor={id}>{label}</label>
    </div>
  );
}
