import { JSX, ReactNode } from 'react';
import './PopupMessage.css';

interface PopupMessageProps {
  children: ReactNode;
  type: 'success' | 'error';
}

export default function PopupMessage({ children, type }: PopupMessageProps): JSX.Element {
  return (
    <div className='popup-message'>
      <span className={type}>{children}</span>
    </div>
  );
}
