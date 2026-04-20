import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import PopupMessage from './PopupMessage';
import { Locator } from 'vitest/browser';

describe('PopupMessage', () => {
  it('should render a span with the children props', async () => {
    const { getByText } = await render(<PopupMessage type='success'>someMessage</PopupMessage>);

    const span: Locator = getByText('someMessage');
    await expect.element(span).toBeVisible();
  });

  it('should render a span with the bg-success class names if the type prop is success', async () => {
    const { getByText } = await render(<PopupMessage type='success'>someMessage</PopupMessage>);

    const span: Locator = getByText('someMessage');
    await expect.element(span).toHaveClass('bg-success');
  });

  it('should render a span with the bg-danger-popup class names if the type prop is error', async () => {
    const { getByText } = await render(<PopupMessage type='error'>someMessage</PopupMessage>);

    const span: Locator = getByText('someMessage');
    await expect.element(span).toHaveClass('bg-danger-popup');
  });
});
