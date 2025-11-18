import { JSX, ReactNode } from 'react';
import ToggleSwitch from '../../../../../../components/ToggleSwitch/ToggleSwitch';

type WishlistsFilterTogglerProps = {
  title: string;
  isToggled: boolean;
  onClick: () => void;
  children: ReactNode;
};

export default function WishlistsFilterToggler({ title, isToggled, onClick, children }: WishlistsFilterTogglerProps): JSX.Element {
  return (
    <div className='grid gap-1'>
      <div className='flex justify-start items-center gap-1'>
        <ToggleSwitch
          isToggled={isToggled}
          onClick={onClick}
        />
        <p className='text-title text-sm leading-[1]'>{title}</p>
      </div>

      {isToggled && children}
    </div>
  );
}
