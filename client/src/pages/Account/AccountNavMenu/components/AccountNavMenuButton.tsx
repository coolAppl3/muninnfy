import { JSX, ReactNode } from 'react';

type AccountNavMenuButtonProps = {
  children: ReactNode;
  isSelected: boolean;
  onClick: () => void;

  className?: string;
};

export default function AccountNavMenuButton({ children, isSelected, onClick, className }: AccountNavMenuButtonProps): JSX.Element {
  return (
    <button
      type='button'
      className={`nav-menu-btn py-[1.6rem] px-2 text-start border-b-1 border-b-light-gray ${isSelected ? 'text-cta' : ''} ${className || ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
