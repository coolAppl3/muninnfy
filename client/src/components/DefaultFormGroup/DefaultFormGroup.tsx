import { ChangeEventHandler, HTMLInputAutoCompleteAttribute, JSX, Ref } from 'react';

type DefaultFormGroupProps = {
  id: string;
  label: string;
  autoComplete: HTMLInputAutoCompleteAttribute;
  value: string;
  errorMessage: string | null;
  onChange: ChangeEventHandler<HTMLInputElement>;
  className?: string;
  ref?: Ref<HTMLInputElement>;
};

export default function DefaultFormGroup({
  id,
  label,
  autoComplete,
  value,
  errorMessage,
  onChange,
  className,
  ref,
}: DefaultFormGroupProps): JSX.Element {
  return (
    <div className={`flex flex-col justify-center items-start gap-[6px] ${className ? className : ''}`}>
      <label
        htmlFor={id}
        className='text-sm font-medium text-title'
      >
        {label}
      </label>

      <input
        type='text'
        name={id}
        id={id}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        ref={ref}
        className={`w-full h-4 p-1 rounded border-1 focus:!border-cta outline-0 text-description font-medium md:text-sm transition-colors ${
          errorMessage ? 'border-danger' : 'border-description/70'
        }`}
      />

      <span className={`text-[12px] font-medium text-danger leading-[1.2] break-words ${errorMessage ? 'block' : 'hidden'}`}>
        {errorMessage}
      </span>
    </div>
  );
}
