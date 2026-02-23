import { FocusEvent, JSX } from 'react';
import TripleDotMenuIcon from '../../../../../assets/svg/TripleDotMenuIcon.svg?react';
import useAccountProfile from '../../../hooks/useAccountProfile';

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
        <TripleDotMenuIcon className={`w-[1.6rem] h-[1.6rem] transition-colors ${menuIsOpen ? 'text-cta' : ''}`} />
      </button>

      <div className={`absolute top-0 right-[4.4rem] rounded-sm overflow-hidden shadow-centered-tiny ${menuIsOpen ? 'block' : 'hidden'}`}>
        <button
          type='button'
          className={`context-menu-btn ${profileSection === 'privacySettings' ? 'text-cta' : ''}`}
          onClick={() => {
            setMenuIsOpen(false);
            setProfileSection('privacySettings');
          }}
        >
          Privacy settings
        </button>

        <button
          type='button'
          className={`context-menu-btn ${profileSection === 'changeDisplayName' ? 'text-cta' : ''}`}
          onClick={() => {
            setMenuIsOpen(false);
            setProfileSection('changeDisplayName');
          }}
        >
          Change display name
        </button>

        <button
          type='button'
          className={`context-menu-btn ${profileSection === 'changePassword' ? 'text-cta' : ''}`}
          onClick={() => {
            setMenuIsOpen(false);
            setProfileSection('changePassword');
          }}
        >
          Change password
        </button>

        <button
          type='button'
          className={`context-menu-btn border-t-1 border-t-description/50 ${profileSection === 'changeEmail' ? 'text-cta' : ''}`}
          onClick={() => {
            setMenuIsOpen(false);
            setProfileSection('changeEmail');
          }}
        >
          Change email address
        </button>

        <button
          type='button'
          className={`context-menu-btn ${profileSection === 'deleteAccount' ? 'text-cta' : 'text-danger'}`}
          onClick={() => {
            setMenuIsOpen(false);
            setProfileSection('deleteAccount');
          }}
        >
          Delete account
        </button>
      </div>
    </header>
  );
}
