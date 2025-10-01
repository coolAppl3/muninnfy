import { JSX, MouseEventHandler } from 'react';

type SecondaryButtonProps = {
  children: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  disabled?: boolean;
};

export default function SecondaryButton({ children, onClick, className, disabled }: SecondaryButtonProps): JSX.Element {
  return (
    <button
      type='button'
      disabled={disabled}
      onClick={onClick}
      className={`btn-secondary block min-w-fit p-0 underline transition-colors ease-out font-bold text-description  ${
        disabled ? 'opacity-25 cursor-default hover:text-description' : 'hover:text-cta cursor-pointer'
      } ${className ? className : ''}`}
    >
      {children}
    </button>
  );
}
