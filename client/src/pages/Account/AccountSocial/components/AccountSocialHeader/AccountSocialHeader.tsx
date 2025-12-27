import { FocusEvent, JSX, useState } from 'react';
import TripleDotMenuIcon from '../../../../../assets/svg/TripleDotMenuIcon.svg?react';
import StatisticItem from '../../../../../components/StatisticItem/StatisticItem';

// TODO: continue implementation
export default function AccountSocialHeader(): JSX.Element {
  const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);

  return (
    <header>
      <div
        className='flex justify-between items-center mb-1 text-title relative'
        onBlur={(e: FocusEvent) => {
          if (e.relatedTarget?.classList.contains('context-menu-btn')) {
            return;
          }

          setMenuIsOpen(false);
        }}
      >
        <h3 className='text-md font-normal'>Social</h3>

        <button
          type='button'
          className='bg-dark p-1 rounded-[50%] shadow-simple-tiny cursor-pointer transition-[filter] hover:brightness-75'
          onClick={() => setMenuIsOpen((prev) => !prev)}
          title={`${menuIsOpen ? 'Hide' : 'View'} profile menu`}
          aria-label={`${menuIsOpen ? 'Hide' : 'View'} profile menu`}
        >
          <TripleDotMenuIcon className={`w-[1.6rem] h-[1.6rem] transition-colors ${menuIsOpen ? 'text-cta' : ''}`} />
        </button>

        <div className={`absolute top-0 right-[4.4rem] rounded-sm overflow-hidden shadow-centered-tiny ${menuIsOpen ? 'block' : 'hidden'}`}>
          <button
            type='button'
            className='context-menu-btn bg-primary'
            onClick={() => {
              // TODO: implement
            }}
          >
            Copy account link
          </button>

          <button
            type='button'
            className='context-menu-btn bg-primary'
            onClick={() => {
              // TODO: implement
            }}
          >
            Find account
          </button>
        </div>
      </div>

      <div>
        <div className='grid md:grid-cols-3 gap-1 text-sm text-description relative z-0 h-fit'>
          <button
            type='button'
            className={`flex justify-start items-center text-start p-1 bg-dark rounded cursor-pointer transition-[filter] hover:brightness-75 ${
              true ? 'text-cta' : ''
            }`}
          >
            <StatisticItem
              title='Followers'
              value='13'
            />
          </button>

          <button
            type='button'
            className={`flex justify-start items-center text-start p-1 bg-dark rounded cursor-pointer transition-[filter] hover:brightness-75 ${
              false ? 'text-cta' : ''
            }`}
          >
            <StatisticItem
              title='Following'
              value='24'
            />
          </button>

          <button
            type='button'
            className={`flex justify-start items-center text-start p-1 bg-dark rounded cursor-pointer transition-[filter] hover:brightness-75 ${
              false ? 'text-cta' : ''
            }`}
          >
            <StatisticItem
              title='Follow requests'
              value='3'
            />
          </button>
        </div>
      </div>
    </header>
  );
}
