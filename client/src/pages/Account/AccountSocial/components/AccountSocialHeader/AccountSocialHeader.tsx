import { FocusEvent, JSX } from 'react';
import TripleDotMenuIcon from '../../../../../assets/svg/TripleDotMenuIcon.svg?react';
import StatisticItem from '../../../../../components/StatisticItem/StatisticItem';
import useAccountSocial from '../../../hooks/useAccountSocial';

export default function AccountSocialHeader(): JSX.Element {
  const { menuIsOpen, socialSection, setMenuIsOpen, setSocialSection } = useAccountSocial();

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
              setMenuIsOpen(false);
              // TODO: continue implementation
            }}
          >
            Copy account link
          </button>

          <button
            type='button'
            className={`context-menu-btn bg-primary ${socialSection === 'FIND_ACCOUNT' ? 'text-cta' : ''}`}
            onClick={() => {
              setMenuIsOpen(false);
              setSocialSection('FIND_ACCOUNT');
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
            onClick={() => setSocialSection('FOLLOWERS')}
            className={`flex justify-start items-center text-start p-1 bg-dark rounded cursor-pointer transition-[filter] hover:brightness-75 ${
              socialSection === 'FOLLOWERS' ? 'text-cta' : ''
            }`}
          >
            <StatisticItem
              title='Followers'
              value='13'
              // TODO: use fetched values
            />
          </button>

          <button
            type='button'
            onClick={() => setSocialSection('FOLLOWING')}
            className={`flex justify-start items-center text-start p-1 bg-dark rounded cursor-pointer transition-[filter] hover:brightness-75 ${
              socialSection === 'FOLLOWING' ? 'text-cta' : ''
            }`}
          >
            <StatisticItem
              title='Following'
              value='24'
              // TODO: use fetched values
            />
          </button>

          <button
            type='button'
            onClick={() => setSocialSection('FOLLOW_REQUESTS')}
            className={`flex justify-start items-center text-start p-1 bg-dark rounded cursor-pointer transition-[filter] hover:brightness-75 ${
              socialSection === 'FOLLOW_REQUESTS' ? 'text-cta' : ''
            }`}
          >
            <StatisticItem
              title='Follow requests'
              value='3'
              // TODO: use fetched values
            />
          </button>
        </div>
      </div>
    </header>
  );
}
