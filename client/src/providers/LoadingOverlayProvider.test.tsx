import { JSX } from 'react';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { Locator, userEvent } from 'vitest/browser';
import useLoadingOverlay from '../hooks/useLoadingOverlay';
import LoadingOverlayProvider from './LoadingOverlayProvider';
import { BrowserRouter, NavigateFunction, useNavigate } from 'react-router-dom';

function TestComponent(): JSX.Element {
  const { displayLoadingOverlay, removeLoadingOverlay } = useLoadingOverlay();
  const navigate: NavigateFunction = useNavigate();

  return (
    <>
      <button
        type='button'
        className='relative z-29'
        onClick={() => displayLoadingOverlay()}
      >
        Display overlay
      </button>

      <button
        type='button'
        className='relative z-31'
        onClick={() => removeLoadingOverlay()}
      >
        Remove overlay
      </button>

      <button
        type='button'
        className='relative z-31'
        onClick={() => navigate('/somePage')}
      >
        Navigate
      </button>
    </>
  );
}

describe('LoadingOverlayProvider', () => {
  it('should display an overlay with a z-index of 30 if displayLoadingOverlay is called', async () => {
    const { getByRole, getByLabelText } = await render(
      <LoadingOverlayProvider>
        <TestComponent />
      </LoadingOverlayProvider>,
      { wrapper: BrowserRouter }
    );

    const displayOverlayBtn: Locator = getByRole('button', { name: 'Display overlay' });
    await userEvent.click(displayOverlayBtn);

    const overlay: Locator = getByLabelText('Loading overlay');
    await expect.element(overlay).toBeInTheDocument();
    await expect.element(overlay).toHaveClass('z-30');
  });

  it('should remove the overlay if removeLoadingOverlay is called', async () => {
    const { getByRole, getByLabelText } = await render(
      <LoadingOverlayProvider>
        <TestComponent />
      </LoadingOverlayProvider>,
      { wrapper: BrowserRouter }
    );

    const displayOverlayBtn: Locator = getByRole('button', { name: 'Display overlay' });
    const removeOverlayBtn: Locator = getByRole('button', { name: 'Remove overlay' });
    await userEvent.click(displayOverlayBtn);

    const overlay: Locator = getByLabelText('Loading overlay');
    await expect.element(overlay).toBeInTheDocument();

    await userEvent.click(removeOverlayBtn);
    await expect.element(overlay).not.toBeInTheDocument();
  });

  it('should remove the overlay if if the location changes', async () => {
    const { getByRole, getByLabelText } = await render(
      <LoadingOverlayProvider>
        <TestComponent />
      </LoadingOverlayProvider>,
      { wrapper: BrowserRouter }
    );

    const displayOverlayBtn: Locator = getByRole('button', { name: 'Display overlay' });
    const navigateBtn: Locator = getByRole('button', { name: 'Navigate' });
    await userEvent.click(displayOverlayBtn);

    const overlay: Locator = getByLabelText('Loading overlay');
    await expect.element(overlay).toBeInTheDocument();

    await userEvent.click(navigateBtn);
    await expect.element(overlay).not.toBeInTheDocument();
  });
});
