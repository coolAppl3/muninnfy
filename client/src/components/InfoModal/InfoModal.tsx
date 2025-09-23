import { JSX, MouseEventHandler, useEffect, useRef, useState } from 'react';
import './InfoModal.css';
import Button from '../Button/Button';

export type InfoModalProps = {
  title?: string;
  description?: string;
  btnTitle: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

export default function InfoModal({ title, description, btnTitle, onClick }: InfoModalProps): JSX.Element {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsVisible(true);
    modalRef.current?.focus();
  }, []);

  return (
    <div
      className={`info-modal ${isVisible ? 'visible' : ''}`}
      tabIndex={0}
      ref={modalRef}
    >
      <div className={`info-modal-container ${title ? '' : 'no-title'}`}>
        {title && <h4>{title}</h4>}
        {description && description.split('\n').map((descriptionLine: string, index: number) => <p key={index}>{descriptionLine}</p>)}

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
