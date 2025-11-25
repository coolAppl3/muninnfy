import { JSX, MouseEventHandler } from 'react';
import CheckIcon from '../../assets/svg/CheckIcon.svg?react';

type FilterTogglerCheckboxBtnProps = {
  onClick: MouseEventHandler;
  title: string;
  isChecked: boolean;
};

export default function FilterTogglerCheckboxBtn({ onClick, title, isChecked }: FilterTogglerCheckboxBtnProps): JSX.Element {
  return (
    <button
      type='button'
      onClick={onClick}
      className='flex justify-center items-center gap-[4px] w-fit cursor-pointer transition-[filter] hover:brightness-75'
    >
      <div className='grid place-items-center w-[1.4rem] h-[1.4rem] bg-[#555] rounded-[1px]'>
        <CheckIcon
          className={`w-[1rem] h-[1rem] transition-transform text-cta ${isChecked ? 'scale-100 rotate-0' : 'rotate-180 scale-0'}`}
        />
      </div>
      <span className='text-sm text-description leading-[1]'>{title}</span>
    </button>
  );
}
