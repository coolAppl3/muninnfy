import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../hooks/useAuth');
vi.mock('../NavbarAccountMenu/NavbarAccountMenu', () => ({
  default: () => <div data-testId='account-menu'></div>,
}));

import { MemoryRouter } from 'react-router-dom';
import BottomNavbar from './BottomNavbar';
import { render } from 'vitest-browser-react';
import AuthProvider from '../../providers/AuthProvider';
import { page } from 'vitest/browser';
import useAuth from '../../hooks/useAuth';
import { JSX, ReactNode } from 'react';

function TestWrapper({ children }: { children: ReactNode }): JSX.Element {
  return (
    <AuthProvider>
      <MemoryRouter>{children}</MemoryRouter>
    </AuthProvider>
  );
}

describe('BottomNavbar', () => {
  it('should not render if the viewport width is above 830px', async () => {
    page.viewport(831, 720);

    const { getByRole } = await render(<BottomNavbar />, { wrapper: TestWrapper });

    const nav = getByRole('navigation', { includeHidden: true });
    await expect.element(nav).not.toBeVisible();
  });

  it('should render if the viewport width is 830px or lower', async () => {
    page.viewport(830, 720);

    const { getByRole } = await render(<BottomNavbar />, { wrapper: TestWrapper });

    const nav = getByRole('navigation', { includeHidden: true });
    await expect.element(nav).toBeVisible();
  });

  beforeEach(() => {
    page.viewport(830, 720);
  });

  it('should render the Home and Wishlists links', async () => {
    const { getByRole } = await render(<BottomNavbar />, { wrapper: TestWrapper });

    const homeLink = getByRole('link', { name: 'Home' });
    const wishlistsLink = getByRole('link', { name: 'Wishlists' });

    await expect.element(homeLink).toBeVisible();
    await expect.element(wishlistsLink).toBeVisible();
  });

  it('should render NavbarAccountMenu if the authStatus is authenticated', async () => {
    vi.mocked(useAuth).mockImplementation(() => ({
      authStatus: 'authenticated',
      setAuthStatus: vi.fn(),
    }));

    const { getByTestId } = await render(<BottomNavbar />, {
      wrapper: TestWrapper,
    });

    const menuBtn = getByTestId('account-menu');
    await expect.element(menuBtn).toBeVisible();
  });

  it('should render a sign in link if the authStatus is unauthenticated', async () => {
    vi.mocked(useAuth).mockImplementation(() => ({
      authStatus: 'unauthenticated',
      setAuthStatus: vi.fn(),
    }));

    const { getByRole } = await render(<BottomNavbar />, {
      wrapper: TestWrapper,
    });

    const signInLink = getByRole('link', { name: 'Sign in' });
    await expect.element(signInLink).toBeVisible();
  });
});
