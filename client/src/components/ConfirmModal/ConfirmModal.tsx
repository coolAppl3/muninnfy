import { JSX, MouseEventHandler, useEffect, useRef, useState } from 'react';
import Button from '../Button/Button';

export type ConfirmModalProps = {
  title?: string;
  description?: string;

  confirmBtnTitle: string;
  cancelBtnTitle: string;
  extraBtnTitle?: string;

  isDangerous: boolean;

  onConfirm: MouseEventHandler<HTMLButtonElement>;
  onCancel: MouseEventHandler<HTMLButtonElement>;
  onExtraAction?: MouseEventHandler<HTMLButtonElement>;
};

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

    return () => {
      modalRef.current = null;
    };
  }, []);

  return (
    <div
      className='fixed top-0 left-0 w-full h-[100vh] bg-overlay z-10 flex justify-center items-center outline-none'
      tabIndex={0}
      ref={modalRef}
    >
      <div
        className={`grid gap-1 w-[32rem] max-w-[32rem] py-3 px-2 mx-2 rounded-sm bg-primary border-1 border-cta/15 shadow-simple-tiny break-words overflow-hidden transition-all ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
        }`}
      >
        {title && <h4 className='text-title font-medium overflow-hidden'>{title}</h4>}

        {description &&
          description.split('\n').map((descriptionLine: string, index: number) => (
            <p
              key={index}
              className={`${title ? 'text-description overflow-hidden' : 'text-title'} text-sm overflow-hidden`}
            >
              {descriptionLine}
            </p>
          ))}

        <div className='mt-1 grid gap-1'>
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
              className='bg-description border-description mt-1'
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
