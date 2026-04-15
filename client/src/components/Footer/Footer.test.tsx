import { describe, expect, it, vi } from 'vitest';

vi.mock('../../hooks/useAuth');

import { render } from 'vitest-browser-react';
import Footer from './Footer';
import useAuth from '../../hooks/useAuth';
import AuthProvider from '../../providers/AuthProvider';
import { MemoryRouter } from 'react-router-dom';
import { JSX, ReactNode } from 'react';

function TestWrapper({ children }: { children: ReactNode }): JSX.Element {
  return (
    <AuthProvider>
      <MemoryRouter>{children}</MemoryRouter>
    </AuthProvider>
  );
}

describe('Footer', () => {
  it('should render all 10 links with the correct href attribute', async () => {
    const { getByRole } = await render(<Footer />, { wrapper: TestWrapper });

    const allLinks = getByRole('link');
    await expect.element(allLinks).toHaveLength(10);

    const firstsHomeLink = getByRole('link', { name: 'Muninnfy' });
    const secondHomeLink = getByRole('link', { name: 'home' });
    const newWishlistsLink = getByRole('link', { name: 'New wishlist' });
    const signUpLink = getByRole('link', { name: 'Sign up' });
    const signInLink = getByRole('link', { name: 'Sign in' });
    const accountRecoveryLink = getByRole('link', { name: 'Account recovery' });
    const faqLink = getByRole('link', { name: 'FAQ' });
    const termsOfServiceLink = getByRole('link', { name: 'Terms of Service' });
    const privacyPolicyLink = getByRole('link', { name: 'Privacy Policy' });
    const cookiePolicyLLink = getByRole('link', { name: 'Cookie policy' });

    await expect.element(firstsHomeLink).toBeVisible();
    await expect.element(firstsHomeLink).toHaveAttribute('href', '/home');

    await expect.element(secondHomeLink).toBeVisible();
    await expect.element(secondHomeLink).toHaveAttribute('href', '/home');

    await expect.element(newWishlistsLink).toBeVisible();
    await expect.element(newWishlistsLink).toHaveAttribute('href', '/sign-up');

    await expect.element(signUpLink).toBeVisible();
    await expect.element(signUpLink).toHaveAttribute('href', '/sign-up');

    await expect.element(signInLink).toBeVisible();
    await expect.element(signInLink).toHaveAttribute('href', '/sign-in');

    await expect.element(accountRecoveryLink).toBeVisible();
    await expect.element(accountRecoveryLink).toHaveAttribute('href', '/account/recovery');

    await expect.element(faqLink).toBeVisible();
    await expect.element(faqLink).toHaveAttribute('href', '/faq');

    await expect.element(termsOfServiceLink).toBeVisible();
    await expect.element(termsOfServiceLink).toHaveAttribute('href', '/terms-of-service');

    await expect.element(privacyPolicyLink).toBeVisible();
    await expect.element(privacyPolicyLink).toHaveAttribute('href', '/privacy-policy');

    await expect.element(cookiePolicyLLink).toBeVisible();
    await expect.element(cookiePolicyLLink).toHaveAttribute('href', '/cookie-policy');
  });

  it('should change the href attribute for the New wishlists link to /wishlist/new if the user is authenticated', async () => {
    vi.mocked(useAuth).mockImplementation(() => ({
      authStatus: 'authenticated',
      setAuthStatus: vi.fn(),
    }));

    const { getByRole } = await render(<Footer />, { wrapper: TestWrapper });

    const allLinks = getByRole('link');
    await expect.element(allLinks).toHaveLength(10);

    const newWishlistsLink = getByRole('link', { name: 'New wishlist' });
    await expect.element(newWishlistsLink).toHaveAttribute('href', '/wishlist/new');
  });
});
