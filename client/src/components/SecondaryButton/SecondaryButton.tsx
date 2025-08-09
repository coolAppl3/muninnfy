import { JSX, MouseEventHandler } from 'react';
import './SecondaryButton.css';

interface SecondaryButtonProps {
  children: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  disabled?: boolean;
}

export default function SecondaryButton({ children, onClick, className, disabled = false }: SecondaryButtonProps): JSX.Element {
  return (
    <button
      type='button'
      disabled={disabled}
      className={`SecondaryButton ${className} ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
