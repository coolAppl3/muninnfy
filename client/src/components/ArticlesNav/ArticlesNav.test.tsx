import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import ArticlesNav from './ArticlesNav';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

describe('ArticlesNav', () => {
  it('should render 4 Link components if the screen size is above 830px', async () => {
    await page.viewport(831, 720);

    const { getByRole } = await render(
      <MemoryRouter>
        <ArticlesNav />
      </MemoryRouter>
    );

    const allLinks = getByRole('link');
    const termsOfServiceLink = getByRole('link', { name: 'Terms of Service' });
    const privacyPolicyLink = getByRole('link', { name: 'Privacy Policy' });
    const cookiePolicyLink = getByRole('link', { name: 'Cookie Policy' });
    const faqLink = getByRole('link', { name: 'FAQ' });

    await expect.element(allLinks).toHaveLength(4);
    await expect.element(termsOfServiceLink).toBeVisible();
    await expect.element(privacyPolicyLink).toBeVisible();
    await expect.element(cookiePolicyLink).toBeVisible();
    await expect.element(faqLink).toBeVisible();
  });

  it('should not render if the viewport width is 830px or lower', async () => {
    await page.viewport(830, 720);

    const { getByRole } = await render(
      <MemoryRouter>
        <ArticlesNav />
      </MemoryRouter>
    );

    const nav = getByRole('navigation', { includeHidden: true });
    await expect.element(nav).not.toBeVisible();
  });

  it('should add a text-cta class to the active link', async () => {
    const { getByRole } = await render(
      <MemoryRouter initialEntries={['/faq']}>
        <ArticlesNav />
      </MemoryRouter>
    );

    const link = getByRole('link', { name: 'FAQ' });
    await expect.element(link).toHaveClass('text-cta');
  });
});
