import { FocusEvent, JSX, useState } from 'react';
import useAuthSession from '../../hooks/useAuthSession';
import useConfirmModal from '../../hooks/useConfirmModal';
import ChevronIcon from '../../assets/svg/ChevronIcon.svg?react';
import { Link } from 'react-router-dom';

type NavbarAccountMenuProps = {
  navbarType: 'top' | 'bottom';
};

export default function NavbarAccountMenu({ navbarType }: NavbarAccountMenuProps): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const { signOut } = useAuthSession();
  const { displayConfirmModal, removeConfirmModal } = useConfirmModal();

  function handleClick(): void {
    setIsOpen((prev) => !prev);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsVisible((prev) => !prev);
      });
    });
  }

  return (
    <div
      className={`relative ${navbarType === 'bottom' ? 'relative flex justify-center items-center' : 'hidden md:block'}`}
      onBlur={(e: FocusEvent<HTMLDivElement>) => {
        if (e.relatedTarget?.classList.contains('context-menu-btn')) {
          return;
        }

        setIsVisible(false);
        setIsOpen(false);
      }}
    >
      <button
        type='button'
        onClick={handleClick}
        className={`flex justify-between items-center gap-1 px-[1.2rem] py-[4px] border-2 rounded-pill cursor-pointer transition-colors ${
          isVisible ? 'text-cta border-cta' : 'text-title border-title hover:text-cta hover:border-cta'
        }`}
      >
        <span className='text-sm font-medium'>Menu</span>
        <ChevronIcon className={`w-[1.6rem] h-[1.6rem] transition-transform ${isVisible ? '-rotate-180' : ''}`} />
      </button>

      <div
        className={`absolute rounded-sm overflow-hidden shadow-centered-tiny transform-gpu transition-all ${
          navbarType === 'top' ? 'top-4 right-0' : 'bottom-[6.4rem] right-[1px] w-full border-1 border-cta'
        } ${isOpen ? 'block' : 'hidden'} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}
      >
        <Link
          to='/account'
          className='context-menu-btn bg-secondary'
          onClick={() => {
            setIsVisible(false);
            setIsOpen(false);
          }}
        >
          My account
        </Link>
        <Link
          to='/account/wishlists'
          className='context-menu-btn bg-secondary'
          onClick={() => {
            setIsVisible(false);
            setIsOpen(false);
          }}
        >
          Wishlists
        </Link>

        <button
          type='button'
          onClick={async () => {
            displayConfirmModal({
              title: 'Are you sure you want to sign out?',
              confirmBtnTitle: 'Confirm',
              cancelBtnTitle: 'Cancel',
              isDangerous: true,
              onConfirm: async () => {
                removeConfirmModal();

                setIsVisible(false);
                setIsOpen(false);

                await signOut();
              },
              onCancel: removeConfirmModal,
            });
          }}
          className='context-menu-btn danger bg-secondary'
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
