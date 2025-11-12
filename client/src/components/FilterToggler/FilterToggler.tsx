import { Dispatch, JSX, MouseEventHandler, SetStateAction } from 'react';
import ToggleSwitch from '../ToggleSwitch/ToggleSwitch';
import CheckIcon from '../../assets/svg/CheckIcon.svg?react';

type FilterTogglerProps = {
  filterBy: boolean | null;
  setFilterBy: Dispatch<SetStateAction<boolean | null>>;
  title: string;
  positiveFilterTitle: string | null;
  negativeFilterTitle: string | null;
};

export default function FilterToggler({
  filterBy,
  setFilterBy,
  title,
  positiveFilterTitle,
  negativeFilterTitle,
}: FilterTogglerProps): JSX.Element {
  return (
    <div className='grid gap-1'>
      <header className='flex justify-start items-center gap-1'>
        <ToggleSwitch
          isToggled={filterBy !== null}
          setIsToggled={() => setFilterBy((prev) => (prev === null ? true : null))}
        />
        <p className='text-title text-sm leading-[1]'>{title}</p>
      </header>

      {positiveFilterTitle && negativeFilterTitle && (
        <div className={`gap-[1.4rem] pl-1 ${filterBy === null ? 'hidden' : 'grid'}`}>
          <FilterTogglerBtn
            onClick={() => setFilterBy(true)}
            title={positiveFilterTitle}
            isChecked={filterBy === true}
          />

          <FilterTogglerBtn
            onClick={() => setFilterBy(false)}
            title={negativeFilterTitle}
            isChecked={filterBy === false}
          />
        </div>
      )}
    </div>
  );
}

type FilterTogglerBtnProps = {
  onClick: MouseEventHandler;
  title: string;
  isChecked: boolean;
};

function FilterTogglerBtn({ onClick, title, isChecked }: FilterTogglerBtnProps): JSX.Element {
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
