import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import WishlistPrivacyLevelIcon from './WishlistPrivacyLevelIcon';
import {
  FOLLOWERS_WISHLIST_PRIVACY_LEVEL,
  PRIVATE_WISHLIST_PRIVACY_LEVEL,
  PUBLIC_WISHLIST_PRIVACY_LEVEL,
} from '../../utils/constants/wishlistConstants';

describe('WishlistPrivacyLevelIcon', () => {
  it('should render a span with the title or Private and an aria-label of Private wishlist if the privacyLevel prop is private', async () => {
    const { getByTitle } = await render(
      <WishlistPrivacyLevelIcon privacyLevel={PRIVATE_WISHLIST_PRIVACY_LEVEL} />
    );

    const span = getByTitle('Private');
    await expect.element(span).toBeVisible();
  });

  it('should render a span with the title or Followers and an aria-label of Followers only wishlist if the privacyLevel prop is followers', async () => {
    const { getByTitle } = await render(
      <WishlistPrivacyLevelIcon privacyLevel={FOLLOWERS_WISHLIST_PRIVACY_LEVEL} />
    );

    const span = getByTitle('Followers');
    await expect.element(span).toBeVisible();
  });

  it('should render a span with the title or public and an aria-label of public wishlist if the privacyLevel prop is private', async () => {
    const { getByTitle } = await render(
      <WishlistPrivacyLevelIcon privacyLevel={PUBLIC_WISHLIST_PRIVACY_LEVEL} />
    );

    const span = getByTitle('public');
    await expect.element(span).toBeVisible();
  });
});
