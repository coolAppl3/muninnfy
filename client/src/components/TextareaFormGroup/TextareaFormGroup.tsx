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
    <div className={`flex flex-col justify-center items-start gap-[6px] ${className ? className : ''}`}>
      <label
        htmlFor={id}
        className='text-sm font-medium text-title'
      >
        {label}
      </label>

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
        className={`w-full h-4 p-1 rounded border-1 focus:!border-cta outline-0 text-description font-medium md:text-sm transition-colors max-h-[50rem] min-h-8 ${
          errorMessage ? 'border-danger' : 'border-description/70'
        }`}
      ></textarea>

      <span className={`text-[12px] font-medium text-danger leading-[1.2] break-words ${errorMessage ? 'block' : 'hidden'}`}>
        {errorMessage}
      </span>
    </div>
  );
}
