import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { Locator } from 'vitest/browser';
import useAuth from '../../hooks/useAuth';
import TopNavbar from './TopNavbar';
import { MemoryRouter } from 'react-router-dom';
import AuthProvider from '../../providers/AuthProvider';
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

describe('TopNavbar', () => {
  it('should render 2 /home links', async () => {
    const { getByRole } = await render(<TopNavbar />, { wrapper: TestWrapper });

    const logoHomeLink: Locator = getByRole('link', { name: 'Muninnfy' });
    const homeLink: Locator = getByRole('link', { name: 'Home' });

    await expect.element(logoHomeLink).toBeVisible();
    await expect.element(logoHomeLink).toHaveAttribute('href', '/home');

    await expect.element(homeLink).toBeVisible();
    await expect.element(homeLink).toHaveAttribute('href', '/home');
  });

  it('should render a wishlists link', async () => {
    const { getByRole } = await render(<TopNavbar />, { wrapper: TestWrapper });

    const link: Locator = getByRole('link', { name: 'Wishlists' });
    await expect.element(link).toBeVisible();
    await expect.element(link).toHaveAttribute('href', '/wishlists');
  });

  it('should render sign in and sign up buttons if the authStatus is unauthenticated', async () => {
    vi.mocked(useAuth).mockImplementation(() => ({
      authStatus: 'unauthenticated',
      setAuthStatus: vi.fn(),
    }));

    const { getByRole } = await render(<TopNavbar />, { wrapper: TestWrapper });

    const signInBtn: Locator = getByRole('button', { name: 'Sign in' });
    const signUpBtn: Locator = getByRole('button', { name: 'Sign up' });

    await expect.element(signInBtn).toBeVisible();
    await expect.element(signUpBtn).toBeVisible();
  });

  it('should render only a sign in button if the authStatus is equal unauthenticated and the current location is equal to /sign-up', async () => {
    vi.mocked(useAuth).mockImplementation(() => ({
      authStatus: 'unauthenticated',
      setAuthStatus: vi.fn(),
    }));

    const { getByRole } = await render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/sign-up']}>
          <TopNavbar />
        </MemoryRouter>
      </AuthProvider>
    );

    const signInBtn: Locator = getByRole('button', { name: 'Sign in' });
    await expect.element(signInBtn).toBeVisible();
  });

  it('should render only a sign up button if the authStatus is unauthenticated and the current location is equal to /sign-up', async () => {
    vi.mocked(useAuth).mockImplementation(() => ({
      authStatus: 'unauthenticated',
      setAuthStatus: vi.fn(),
    }));

    const { getByRole } = await render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/sign-in']}>
          <TopNavbar />
        </MemoryRouter>
      </AuthProvider>
    );

    const signInBtn: Locator = getByRole('button', { name: 'Sign up' });
    await expect.element(signInBtn).toBeVisible();
  });

  it('should render the NavbarAccountMenu component if the authStatus is equal to authenticated', async () => {
    vi.mocked(useAuth).mockImplementation(() => ({
      authStatus: 'authenticated',
      setAuthStatus: vi.fn(),
    }));

    const { getByTestId } = await render(<TopNavbar />, { wrapper: TestWrapper });

    const NavbarAccountMenuComponent: Locator = getByTestId('account-menu');
    await expect.element(NavbarAccountMenuComponent).toBeInTheDocument();
  });
});
