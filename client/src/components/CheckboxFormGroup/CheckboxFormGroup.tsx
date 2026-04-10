import { JSX, MouseEventHandler, ReactNode } from 'react';
import CheckIcon from '../../assets/svg/CheckIcon.svg?react';

type CheckboxFormGroupProps = {
  label: ReactNode;
  id: string;
  isChecked: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
  className?: string;
};

export default function CheckboxFormGroup({
  label,
  id,
  isChecked,
  onClick,
  className,
}: CheckboxFormGroupProps): JSX.Element {
  return (
    <div
      className={`flex justify-start items-start gap-1 relative transition-[filter] hover:brightness-75 max-w-fit ${className || ''}`}
    >
      <button
        type='button'
        id={id}
        title={isChecked ? 'Uncheck' : 'Check'}
        aria-label={isChecked ? 'Uncheck' : 'Check'}
        onClick={onClick}
        className='bg-[#555] w-2 h-2 rounded cursor-pointer grid place-items-center after:absolute after:top-0 after:left-0 after:w-full after:h-full'
      >
        <CheckIcon
          className={`flex-1 text-cta w-[14px] h-[14px] transition-transform z-0 ${isChecked ? 'rotate-0 scale-100' : 'rotate-[720deg] scale-0'}`}
        />
      </button>

      <label
        htmlFor={id}
        className='flex-1 text-sm font-medium text-title cursor-pointer leading-[2rem]'
      >
        {label}
      </label>
    </div>
  );
}
