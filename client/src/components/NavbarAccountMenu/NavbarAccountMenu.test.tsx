import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../hooks/useAuth');
vi.mock('../../hooks/useConfirmModal');
vi.mock('../../hooks/useAuthSession');

import { render } from 'vitest-browser-react';
import NavbarAccountMenu from './NavbarAccountMenu';
import { Locator, userEvent } from 'vitest/browser';
import AuthProvider from '../../providers/AuthProvider';
import { MemoryRouter } from 'react-router-dom';
import ConfirmModalProvider from '../../providers/ConfirmModalProvider';
import { JSX, ReactNode } from 'react';
import Providers from '../../Providers';
import useAuth from '../../hooks/useAuth';
import useConfirmModal from '../../hooks/useConfirmModal';
import useAuthSession from '../../hooks/useAuthSession';

function TestWrapper({ children }: { children: ReactNode }): JSX.Element {
  return (
    <AuthProvider>
      <MemoryRouter>
        <ConfirmModalProvider>
          <Providers>{children}</Providers>
        </ConfirmModalProvider>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe('NavbarAccountMenu', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockImplementation(() => ({
      authStatus: 'authenticated',
      setAuthStatus: vi.fn(),
    }));
  });

  it('should render menu button', async () => {
    const { getByRole } = await render(<NavbarAccountMenu navbarType='top' />, {
      wrapper: TestWrapper,
    });

    const btn: Locator = getByRole('button', { name: 'Menu' });
    await expect.element(btn).toBeVisible();
  });

  it('should render menu button with a type of button', async () => {
    const { getByRole } = await render(<NavbarAccountMenu navbarType='top' />, {
      wrapper: TestWrapper,
    });

    const btn: Locator = getByRole('button', { name: 'Menu' });
    await expect.element(btn).toHaveAttribute('type', 'button');
  });

  it('should render two navigation links if the menu is expanded', async () => {
    const { getByRole } = await render(<NavbarAccountMenu navbarType='top' />, {
      wrapper: TestWrapper,
    });

    const menuBtn: Locator = getByRole('button', { name: 'Menu' });
    await userEvent.click(menuBtn);

    const links: Locator = getByRole('link');

    const myAccountLink: Locator = getByRole('link', { name: 'My account' });
    const newWishlistLink: Locator = getByRole('link', { name: 'New wishlist' });

    await expect.element(links).toHaveLength(2);

    await expect.element(myAccountLink).toBeVisible();
    await expect.element(myAccountLink).toHaveAttribute('href', '/account');

    await expect.element(newWishlistLink).toBeVisible();
    await expect.element(newWishlistLink).toHaveAttribute('href', '/wishlist/new');
  });

  it('should render a sign out button if the menu is expanded', async () => {
    const { getByRole } = await render(<NavbarAccountMenu navbarType='top' />, {
      wrapper: TestWrapper,
    });

    const menuBtn: Locator = getByRole('button', { name: 'Menu' });
    await userEvent.click(menuBtn);

    const signOutBtn: Locator = getByRole('button', { name: 'Sign out' });
    await expect.element(signOutBtn).toBeVisible();
  });

  it('should render a sign out button with a type of button if the menu is expanded', async () => {
    const { getByRole } = await render(<NavbarAccountMenu navbarType='top' />, {
      wrapper: TestWrapper,
    });

    const menuBtn: Locator = getByRole('button', { name: 'Menu' });
    await userEvent.click(menuBtn);

    const signOutBtn: Locator = getByRole('button', { name: 'Sign out' });
    await expect.element(signOutBtn).toHaveAttribute('type', 'button');
  });

  const displayConfirmModal = vi.fn();
  const removeConfirmModal = vi.fn();

  it('should call displayConfirmModal if the sign out button is clicked', async () => {
    vi.mocked(useConfirmModal).mockImplementation(() => ({
      displayConfirmModal,
      removeConfirmModal,
    }));

    const { getByRole } = await render(<NavbarAccountMenu navbarType='top' />, {
      wrapper: TestWrapper,
    });

    const menuBtn: Locator = getByRole('button', { name: 'Menu' });
    await userEvent.click(menuBtn);

    const signOutBtn: Locator = getByRole('button', { name: 'Sign out' });
    await userEvent.click(signOutBtn);

    expect(displayConfirmModal).toHaveBeenCalled();
  });

  it('should call removeConfirmModal and signOut if the sign out action is confirmed', async () => {
    const signOut = vi.fn();

    vi.mocked(useConfirmModal).mockImplementation(() => ({
      displayConfirmModal,
      removeConfirmModal,
    }));

    vi.mocked(useAuthSession).mockImplementation(() => ({
      signOut,
    }));

    const { getByRole } = await render(<NavbarAccountMenu navbarType='top' />, {
      wrapper: TestWrapper,
    });

    const menuBtn: Locator = getByRole('button', { name: 'Menu' });
    await userEvent.click(menuBtn);

    const signOutBtn: Locator = getByRole('button', { name: 'Sign out' });
    await userEvent.click(signOutBtn);

    const modalConfig = displayConfirmModal.mock.calls[0]![0] as {
      onConfirm: () => Promise<void>;
    };
    await modalConfig.onConfirm();

    expect(removeConfirmModal).toHaveBeenCalled();
    expect(signOut).toHaveBeenCalled();
  });

  it('should call removeConfirmModal if the sign out action is cancelled', async () => {
    vi.mocked(useConfirmModal).mockImplementation(() => ({
      displayConfirmModal,
      removeConfirmModal,
    }));

    const { getByRole } = await render(<NavbarAccountMenu navbarType='top' />, {
      wrapper: TestWrapper,
    });

    const menuBtn: Locator = getByRole('button', { name: 'Menu' });
    await userEvent.click(menuBtn);

    const signOutBtn: Locator = getByRole('button', { name: 'Sign out' });
    await userEvent.click(signOutBtn);

    const modalConfig = displayConfirmModal.mock.calls[0]![0] as {
      onCancel: () => void;
    };
    modalConfig.onCancel();

    expect(removeConfirmModal).toHaveBeenCalled();
  });
});
