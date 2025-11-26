import { JSX, ReactNode } from 'react';

type AccountSidebarButtonProps = {
  isSelected: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
};

export default function AccountSidebarButton({ isSelected, onClick, children, className }: AccountSidebarButtonProps): JSX.Element {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`px-2 py-[1.6rem] text-start bg-secondary border-b-1 border-b-light-gray cursor-pointer transition-[filter] hover:brightness-90 last:border-b-secondary ${
        isSelected ? 'text-cta brightness-90' : ''
      } ${className || ''}`}
    >
      {children}
    </button>
  );
}
