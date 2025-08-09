import { JSX, ReactNode } from 'react';
import './Container.css';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export default function Container({ children, className = '' }: ContainerProps): JSX.Element {
  return <div className={`Container ${className}`}>{children}</div>;
}
