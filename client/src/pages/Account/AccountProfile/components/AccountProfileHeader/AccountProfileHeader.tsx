import { FocusEvent, JSX, useState } from 'react';
import TripleDotIcon from '../../../../../assets/svg/TripleDotMenuIcon.svg?react';

export default function AccountProfileHeader(): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <header
      className='flex justify-between items-center mb-[4px] text-title relative'
      onBlur={(e: FocusEvent) => {
        if (e.relatedTarget?.classList.contains('context-menu-btn')) {
          return;
        }

        setIsOpen(false);
      }}
    >
      <h3 className='text-md font-normal'>Personal information</h3>

      <button
        type='button'
        className='bg-dark p-1 rounded-[50%] shadow-simple-tiny cursor-pointer transition-[filter] hover:brightness-75'
        onClick={() => setIsOpen((prev) => !prev)}
        title={`${isOpen ? 'Hide' : 'View'} profile menu`}
        aria-label={`${isOpen ? 'Hide' : 'View'} profile menu`}
      >
        <TripleDotIcon className={`w-[1.6rem] h-[1.6rem] transition-colors ${isOpen ? 'text-cta' : ''}`} />
      </button>

      <div className={`absolute top-0 right-[4.4rem] rounded-sm overflow-hidden shadow-centered-tiny ${isOpen ? 'block' : 'hidden'}`}>
        <button
          type='button'
          className='context-menu-btn'
          onClick={() => {
            setIsOpen(false);
            // TODO: continue implementation
          }}
        >
          Change display name
        </button>

        <button
          type='button'
          className='context-menu-btn'
          onClick={() => {
            setIsOpen(false);
            // TODO: continue implementation
          }}
        >
          Change email address
        </button>
      </div>
    </header>
  );
}
