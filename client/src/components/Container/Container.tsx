import { JSX, ReactNode } from 'react';

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export default function Container({ children, className }: ContainerProps): JSX.Element {
  return <div className={`w-full max-w-[1200px] mx-auto px-2 h-full ${className || ''}`}>{children}</div>;
}
