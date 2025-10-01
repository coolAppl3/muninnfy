import { JSX, ReactNode } from 'react';

export default function Container({ children, className = '' }: { children: ReactNode; className?: string }): JSX.Element {
  return <div className={`max-w-[1200px] mx-auto px-2 h-full ${className}`}>{children}</div>;
}
