import { Dispatch, JSX, MouseEventHandler, SetStateAction } from 'react';
import ToggleSwitch from '../../../../../../components/ToggleSwitch/ToggleSwitch';
import CheckIcon from '../../../../../../assets/svg/CheckIcon.svg?react';

export default function WishlistItemsToolbarFilterItem({
  filterBy,
  setFilterBy,
  title,
  positiveFilterTitle,
  negativeFilterTitle,
}: {
  filterBy: boolean | null;
  setFilterBy: Dispatch<SetStateAction<boolean | null>>;
  title: string;
  positiveFilterTitle: string;
  negativeFilterTitle: string;
}): JSX.Element {
  return (
    <div className={filterBy !== null ? 'mb-2' : 'mb-0'}>
      <header className='flex justify-start items-center gap-1 mb-1'>
        <p className='text-title text-sm leading-[1]'>{title}</p>
        <ToggleSwitch
          isToggled={filterBy !== null}
          setIsToggled={() => setFilterBy((prev) => (prev === null ? true : null))}
        />
      </header>

      <div className={`gap-[1.4rem] pl-1 ${filterBy === null ? 'hidden' : 'grid'}`}>
        <FilterItemButton
          onClick={() => setFilterBy(true)}
          title={positiveFilterTitle}
          isChecked={filterBy === true}
        />

        <FilterItemButton
          onClick={() => setFilterBy(false)}
          title={negativeFilterTitle}
          isChecked={filterBy === false}
        />
      </div>
    </div>
  );
}

function FilterItemButton({ onClick, title, isChecked }: { onClick: MouseEventHandler; title: string; isChecked: boolean }): JSX.Element {
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
