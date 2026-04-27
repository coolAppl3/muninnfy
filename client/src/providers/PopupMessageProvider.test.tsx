import { JSX } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { Locator, userEvent } from 'vitest/browser';
import { DisplayPopupMessageFunction } from '../contexts/PopupMessageContext';
import usePopupMessage from '../hooks/usePopupMessage';
import PopupMessageProvider from './PopupMessageProvider';

function TestComponent(): JSX.Element {
  const displayPopupMessage: DisplayPopupMessageFunction = usePopupMessage();

  return (
    <button
      type='button'
      onClick={() => displayPopupMessage('Some message.', 'success')}
    >
      Display popup
    </button>
  );
}

describe('PopupMessageProvider', () => {
  it('should render a span with the popup message passed when calling displayPopupMessage for 2000 milliseconds', async () => {
    vi.useFakeTimers();

    const { getByRole, getByText } = await render(
      <PopupMessageProvider>
        <TestComponent />
      </PopupMessageProvider>
    );

    const displayPopupBtn: Locator = getByRole('button', { name: 'Display popup' });
    await userEvent.click(displayPopupBtn);

    const popupSpan: Locator = getByText('Some message.');
    await expect.element(popupSpan).toBeVisible();

    vi.advanceTimersByTime(2000);
    await expect.element(popupSpan).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});
