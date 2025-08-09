import { JSX, MouseEventHandler, ReactNode } from 'react';
import './Button.css';

interface ButtonProps {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  isSubmitBtn?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export default function Button({ children, className = '', disabled = false, isSubmitBtn = false, onClick }: ButtonProps): JSX.Element {
  return (
    <button
      type={isSubmitBtn ? 'submit' : 'button'}
      disabled={disabled}
      className={`Button ${className} ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
