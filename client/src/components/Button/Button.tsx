import { JSX, MouseEventHandler, ReactNode } from 'react';

type ButtonProps = {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  isSubmitBtn?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

export default function Button({ children, className = '', disabled = false, isSubmitBtn = false, onClick }: ButtonProps): JSX.Element {
  return (
    <button
      type={isSubmitBtn ? 'submit' : 'button'}
      disabled={disabled}
      onClick={onClick}
      className={`block min-w-fit py-1 px-[2.4rem] font-bold text-base text-center leading-[2.2rem] rounded border-1 transition-[filter] ease-out ${className} ${
        disabled ? 'opacity-25 cursor-default hover:brightness-100' : 'cursor-pointer hover:brightness-75'
      }`}
    >
      {children}
    </button>
  );
}
