import { ChangeEvent, ChangeEventHandler, JSX, Ref } from 'react';

type TextareaFormGroupProps = {
  id: string;
  label: string;
  value: string;
  errorMessage: string | null;
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  className?: string;
  ref?: Ref<HTMLTextAreaElement>;
};

export default function TextareaFormGroup({
  id,
  label,
  value,
  errorMessage,
  onChange,
  className,
  ref,
}: TextareaFormGroupProps): JSX.Element {
  function autoAdjustHeight(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight + 2}px`; // +2 accounting for the borders
  }

  return (
    <div className={`form-group ${errorMessage ? 'error' : ''} ${className ? className : ''}`}>
      <label htmlFor={id}>{label}</label>

      <textarea
        name={id}
        id={id}
        autoComplete='off'
        value={value}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
          onChange(e);
          autoAdjustHeight(e.target);
        }}
        ref={ref}
      ></textarea>

      <span className='error-span'>{errorMessage}</span>
    </div>
  );
}
