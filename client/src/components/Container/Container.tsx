import { JSX, ReactNode } from 'react';
import './Container.css';

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export default function Container({ children, className = '' }: ContainerProps): JSX.Element {
  return <div className={`container ${className}`}>{children}</div>;
}
