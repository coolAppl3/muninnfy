import { JSX, MouseEventHandler, useEffect, useRef, useState } from 'react';
import './ConfirmModal.css';
import Button from '../Button/Button';

export interface ConfirmModalProps {
  title?: string;
  description?: string;

  confirmBtnTitle: string;
  cancelBtnTitle: string;
  extraBtnTitle?: string;

  isDangerous: boolean;

  onConfirm: MouseEventHandler<HTMLButtonElement>;
  onCancel: MouseEventHandler<HTMLButtonElement>;
  onExtraAction?: MouseEventHandler<HTMLButtonElement>;
}

export default function ConfirmModal({
  title,
  description,

  confirmBtnTitle,
  cancelBtnTitle,
  extraBtnTitle,

  onConfirm,
  onCancel,
  onExtraAction,

  isDangerous,
}: ConfirmModalProps): JSX.Element {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsVisible(true);
    modalRef.current?.focus();
  }, []);

  return (
    <div
      className={`confirm-modal ${isVisible ? 'visible' : ''}`}
      tabIndex={0}
      ref={modalRef}
    >
      <div className={`confirm-modal-container ${title ? '' : 'no-title'}`}>
        {title && <h4>{title}</h4>}
        {description && description.split('\n').map((descriptionLine, index) => <p key={index}>{descriptionLine}</p>)}

        <div className='btn-container'>
          <Button
            className={isDangerous ? 'bg-danger border-danger' : 'bg-cta border-cta'}
            onClick={onConfirm}
          >
            {confirmBtnTitle}
          </Button>

          <Button
            className='bg-primary border-title text-title'
            onClick={onCancel}
          >
            {cancelBtnTitle}
          </Button>

          {extraBtnTitle && (
            <Button
              className='bg-description border-description'
              onClick={onExtraAction}
            >
              {extraBtnTitle}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
