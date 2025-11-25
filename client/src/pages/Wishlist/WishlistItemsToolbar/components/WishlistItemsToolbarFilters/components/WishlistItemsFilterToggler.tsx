import { JSX } from 'react';
import ToggleSwitch from '../../../../../../components/ToggleSwitch/ToggleSwitch';
import FilterTogglerCheckboxBtn from '../../../../../../components/FilterTogglerCheckboxBtn/FilterTogglerCheckboxBtn';

type WishlistItemsFilterTogglerProps = {
  filterBy: boolean | null;
  setFilterBy: (newValue: boolean | null) => void;
  title: string;
  positiveFilterTitle: string;
  negativeFilterTitle: string;
};

export default function WishlistItemsFilterToggler({
  filterBy,
  setFilterBy,
  title,
  positiveFilterTitle,
  negativeFilterTitle,
}: WishlistItemsFilterTogglerProps): JSX.Element {
  return (
    <div className='grid gap-1'>
      <header className='flex justify-start items-center gap-1'>
        <ToggleSwitch
          isToggled={filterBy !== null}
          onClick={() => setFilterBy(filterBy === null ? true : null)}
        />
        <p className='text-title text-sm leading-[1]'>{title}</p>
      </header>

      <div className={`gap-[1.4rem] pl-1 ${filterBy === null ? 'hidden' : 'grid'}`}>
        <FilterTogglerCheckboxBtn
          onClick={() => setFilterBy(true)}
          title={positiveFilterTitle}
          isChecked={filterBy === true}
        />

        <FilterTogglerCheckboxBtn
          onClick={() => setFilterBy(false)}
          title={negativeFilterTitle}
          isChecked={filterBy === false}
        />
      </div>
    </div>
  );
}
