import { Dispatch, JSX, SetStateAction } from 'react';
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
    <div className={`filter-item ${filterBy === null ? '' : 'open'}`}>
      <header className='flex justify-start items-center gap-1'>
        <p className='text-title text-sm leading-[1]'>{title}</p>
        <ToggleSwitch
          isToggled={filterBy !== null}
          setIsToggled={() => setFilterBy((prev) => (prev === null ? true : null))}
        />
      </header>

      <div className='checkbox-container'>
        <button
          type='button'
          className={`checkbox-btn ${filterBy ? 'checked' : ''}`}
          onClick={() => setFilterBy(true)}
        >
          <div className='checkbox'>
            <CheckIcon />
          </div>
          <span>{positiveFilterTitle}</span>
        </button>
        <button
          type='button'
          className={`checkbox-btn ${filterBy === false ? 'checked' : ''}`}
          onClick={() => setFilterBy(false)}
        >
          <div className='checkbox'>
            <CheckIcon />
          </div>
          <span>{negativeFilterTitle}</span>
        </button>
      </div>
    </div>
  );
}
