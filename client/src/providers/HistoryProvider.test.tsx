import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { Locator, userEvent } from 'vitest/browser';
import HistoryProvider from './HistoryProvider';
import { BrowserRouter, NavigateFunction, useLocation, useNavigate } from 'react-router-dom';
import { JSX } from 'react';
import useHistory from '../hooks/useHistory';

function TestComponent(): JSX.Element {
  const navigate: NavigateFunction = useNavigate();
  const { referrerLocation } = useHistory();

  return (
    <>
      <span data-testId='referrerLocation'>{referrerLocation || 'null'}</span>

      <button
        type='button'
        onClick={() => navigate('/somePage1')}
      >
        Navigate to somePage1
      </button>

      <button
        type='button'
        onClick={() => navigate('/somePage2')}
      >
        Navigate to somePage2
      </button>

      <button
        type='button'
        onClick={() => navigate('/wishlist/new')}
      >
        Navigate to new wishlist
      </button>
    </>
  );
}

describe('HistoryProvider', () => {
  it('should set the last visited path as the referrerLocation', async () => {
    const { getByRole, getByTestId } = await render(
      <HistoryProvider>
        <TestComponent />
      </HistoryProvider>,
      { wrapper: BrowserRouter }
    );

    const referrerLocationSpan: Locator = getByTestId('referrerLocation');
    await expect.element(referrerLocationSpan).toHaveTextContent('null');

    const navigateBtn1: Locator = getByRole('button', { name: 'Navigate to somePage1' });
    const navigateBtn2: Locator = getByRole('button', { name: 'Navigate to somePage2' });

    await userEvent.click(navigateBtn1);
    await expect.element(referrerLocationSpan).toHaveTextContent('/');

    await userEvent.click(navigateBtn2);
    await expect.element(referrerLocationSpan).toHaveTextContent('/somePage1');
  });

  it('should set not update the referrerLocation if the last path was /wishlist/new', async () => {
    const { getByRole, getByTestId } = await render(
      <HistoryProvider>
        <TestComponent />
      </HistoryProvider>,
      { wrapper: BrowserRouter }
    );

    const referrerLocationSpan: Locator = getByTestId('referrerLocation');
    await expect.element(referrerLocationSpan).toHaveTextContent('null');

    const navigateBtn1: Locator = getByRole('button', { name: 'Navigate to somePage1' });
    const navigateBtn2: Locator = getByRole('button', { name: 'Navigate to somePage2' });
    const navigateToNewWishlistBtn: Locator = getByRole('button', {
      name: 'Navigate to new wishlist',
    });

    await userEvent.click(navigateBtn1);
    await expect.element(referrerLocationSpan).toHaveTextContent('/');

    await userEvent.click(navigateBtn2);
    await expect.element(referrerLocationSpan).toHaveTextContent('/somePage1');

    await userEvent.click(navigateToNewWishlistBtn);
    await userEvent.click(navigateBtn1);
    await expect.element(referrerLocationSpan).toHaveTextContent('/somePage2');
  });
});
