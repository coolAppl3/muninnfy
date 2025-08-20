import { JSX, MouseEventHandler, useEffect, useState } from 'react';
import './InfoModal.css';
import Button from '../Button/Button';

export interface InfoModalProps {
  title?: string;
  description?: string;
  btnTitle: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

export default function InfoModal({ title, description, btnTitle, onClick }: InfoModalProps): JSX.Element {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  useEffect(() => setIsVisible(true), []);

  return (
    <div
      className={`confirm-modal ${isVisible ? 'visible' : ''}`}
      tabIndex={0}
    >
      <div className={`confirm-modal-container ${title ? '' : 'no-title'}`}>
        {title && <h4>{title}</h4>}
        {description && description.split('\n').map((descriptionLine, index) => <p key={index}>{descriptionLine}</p>)}

        <Button
          className='bg-description border-description'
          onClick={onClick}
        >
          {btnTitle}
        </Button>
      </div>
    </div>
  );
}
