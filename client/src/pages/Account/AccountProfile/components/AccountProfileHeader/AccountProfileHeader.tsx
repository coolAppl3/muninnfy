import { FocusEvent, JSX } from 'react';
import TripleDotIcon from '../../../../../assets/svg/TripleDotMenuIcon.svg?react';
import useAccountProfile from '../../../contexts/useAccountProfile';

export default function AccountProfileHeader(): JSX.Element {
  const { menuIsOpen, setMenuIsOpen, profileSection, setProfileSection } = useAccountProfile();

  return (
    <header
      className='flex justify-between items-center mb-[4px] text-title relative'
      onBlur={(e: FocusEvent) => {
        if (e.relatedTarget?.classList.contains('context-menu-btn')) {
          return;
        }

        setMenuIsOpen(false);
      }}
    >
      <h3 className='text-md font-normal'>Personal information</h3>

      <button
        type='button'
        className='bg-dark p-1 rounded-[50%] shadow-simple-tiny cursor-pointer transition-[filter] hover:brightness-75'
        onClick={() => setMenuIsOpen((prev) => !prev)}
        title={`${menuIsOpen ? 'Hide' : 'View'} profile menu`}
        aria-label={`${menuIsOpen ? 'Hide' : 'View'} profile menu`}
      >
        <TripleDotIcon className={`w-[1.6rem] h-[1.6rem] transition-colors ${menuIsOpen ? 'text-cta' : ''}`} />
      </button>

      <div className={`absolute top-0 right-[4.4rem] rounded-sm overflow-hidden shadow-centered-tiny ${menuIsOpen ? 'block' : 'hidden'}`}>
        <button
          type='button'
          className={`context-menu-btn ${profileSection === 'PRIVACY_SETTINGS' ? 'text-cta' : ''}`}
          onClick={() => {
            setMenuIsOpen(false);
            setProfileSection('PRIVACY_SETTINGS');
          }}
        >
          Privacy settings
        </button>

        <button
          type='button'
          className={`context-menu-btn ${profileSection === 'CHANGE_DISPLAY_NAME' ? 'text-cta' : ''}`}
          onClick={() => {
            setMenuIsOpen(false);
            setProfileSection('CHANGE_DISPLAY_NAME');
          }}
        >
          Change display name
        </button>

        <button
          type='button'
          className={`context-menu-btn ${profileSection === 'CHANGE_EMAIL' ? 'text-cta' : ''}`}
          onClick={() => {
            setMenuIsOpen(false);
            setProfileSection('CHANGE_EMAIL');
          }}
        >
          Change email address
        </button>

        <button
          type='button'
          className={`context-menu-btn ${profileSection === 'CHANGE_PASSWORD' ? 'text-cta' : ''}`}
          onClick={() => {
            setMenuIsOpen(false);
            setProfileSection('CHANGE_PASSWORD');
          }}
        >
          Change password
        </button>

        <button
          type='button'
          className='context-menu-btn danger'
          onClick={() => {
            setMenuIsOpen(false);
            setProfileSection('DELETE_ACCOUNT');
          }}
        >
          Delete account
        </button>
      </div>
    </header>
  );
}
