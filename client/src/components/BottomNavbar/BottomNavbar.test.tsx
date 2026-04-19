import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import BottomNavbar from './BottomNavbar';
import { render } from 'vitest-browser-react';
import AuthProvider from '../../providers/AuthProvider';
import { Locator, page } from 'vitest/browser';
import useAuth from '../../hooks/useAuth';
import { JSX, ReactNode } from 'react';

vi.mock('../../hooks/useAuth');
vi.mock('../NavbarAccountMenu/NavbarAccountMenu', () => ({
  default: () => <div data-testId='account-menu'></div>,
}));

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

    const nav: Locator = getByRole('navigation', { includeHidden: true });
    await expect.element(nav).not.toBeVisible();
  });

  it('should render if the viewport width is 830px or lower', async () => {
    page.viewport(830, 720);

    const { getByRole } = await render(<BottomNavbar />, { wrapper: TestWrapper });

    const nav: Locator = getByRole('navigation', { includeHidden: true });
    await expect.element(nav).toBeVisible();
  });

  beforeEach(() => {
    page.viewport(830, 720);
  });

  it('should render the Home and Wishlists links', async () => {
    const { getByRole } = await render(<BottomNavbar />, { wrapper: TestWrapper });

    const homeLink: Locator = getByRole('link', { name: 'Home' });
    const wishlistsLink: Locator = getByRole('link', { name: 'Wishlists' });

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

    const menuBtn: Locator = getByTestId('account-menu');
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

    const signInLink: Locator = getByRole('link', { name: 'Sign in' });
    await expect.element(signInLink).toBeVisible();
  });
});
