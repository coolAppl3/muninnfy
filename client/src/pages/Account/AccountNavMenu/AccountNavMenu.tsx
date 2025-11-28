import { FocusEvent, JSX, useState } from 'react';
import HamMenuIcon from '../../../assets/svg/HamMenuIcon.svg?react';
import CrossIcon from '../../../assets/svg/CrossIcon.svg?react';
import useAccountLocation from '../hooks/useAccountLocation';

export default function AccountNavMenu(): JSX.Element {
  const { accountLocation, setAccountLocation } = useAccountLocation();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div
      className='fixed bottom-0 z-10'
      onBlur={(e: FocusEvent) => {
        console.log(e.relatedTarget);

        if (e.relatedTarget?.classList.contains('nav-menu-btn')) {
          return;
        }

        setIsOpen(false);
      }}
    >
      <button
        type='button'
        className='nav-menu-btn md:hidden fixed bottom-7 right-1 z-11 text-title p-1 bg-cta/20 shadow-simple-tiny rounded-[50%]'
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {isOpen ? <CrossIcon className='rotate-45 w-2 h-2 scale-85' /> : <HamMenuIcon className='w-2 h-2' />}
      </button>

      <nav
        className={`md:hidden fixed bottom-6 left-0 w-full bg-secondary grid text-title text-sm font-medium border-t-1 border-t-cta/50 shadow-simple-tiny transform-gpu ${
          isOpen ? 'transition-all opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
        }`}
      >
        <button
          type='button'
          className={`nav-menu-btn py-[1.6rem] px-2 text-start border-b-1 border-b-light-gray ${
            accountLocation === 'overview' ? 'text-cta' : ''
          }`}
          onClick={() => {
            setAccountLocation('overview');
            setIsOpen(false);
          }}
        >
          Overview
        </button>

        <button
          type='button'
          className={`nav-menu-btn py-[1.6rem] px-2 text-start border-b-1 border-b-light-gray ${
            accountLocation === 'social' ? 'text-cta' : ''
          }`}
          onClick={() => {
            setAccountLocation('social');
            setIsOpen(false);
          }}
        >
          Social
        </button>

        <button
          type='button'
          className={`nav-menu-btn py-[1.6rem] px-2 text-start border-b-1 border-b-secondary ${
            accountLocation === 'details' ? 'text-cta' : ''
          }`}
          onClick={() => {
            setAccountLocation('details');
            setIsOpen(false);
          }}
        >
          My details
        </button>
      </nav>
    </div>
  );
}
