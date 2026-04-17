import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import SecondaryButton from './SecondaryButton';
import { userEvent } from 'vitest/browser';

describe('SecondaryButton', () => {
  it('should render a button', async () => {
    const { getByRole } = await render(
      <SecondaryButton onClick={() => {}}>someText</SecondaryButton>
    );

    const btn = getByRole('button', { name: 'someText' });
    await expect.element(btn).toBeVisible();
  });

  it('should render a button with a type of button', async () => {
    const { getByRole } = await render(
      <SecondaryButton onClick={() => {}}>someText</SecondaryButton>
    );

    const btn = getByRole('button', { name: 'someText' });
    await expect.element(btn).toHaveAttribute('type', 'button');
  });

  it('should render a disabled button if the disabled prop is true', async () => {
    const { getByRole } = await render(
      <SecondaryButton
        disabled={true}
        onClick={() => {}}
      >
        someText
      </SecondaryButton>
    );

    const btn = getByRole('button', { name: 'someText' });
    await expect.element(btn).toBeDisabled();
  });

  it('should render an active button if the disabled prop is false', async () => {
    const { getByRole } = await render(
      <SecondaryButton
        disabled={false}
        onClick={() => {}}
      >
        someText
      </SecondaryButton>
    );

    const btn = getByRole('button', { name: 'someText' });
    await expect.element(btn).not.toBeDisabled();
  });

  it('should render a button with the children props', async () => {
    const { getByRole } = await render(
      <SecondaryButton
        disabled={false}
        onClick={() => {}}
      >
        someOtherText
      </SecondaryButton>
    );

    const btn = getByRole('button', { name: 'someOtherText' });
    await expect.element(btn).not.toBeDisabled();
  });

  it('should call onClick when the button is clicked', async () => {
    const onClick = vi.fn();

    const { getByRole } = await render(
      <SecondaryButton
        disabled={false}
        onClick={onClick}
      >
        someOtherText
      </SecondaryButton>
    );

    const btn = getByRole('button', { name: 'someOtherText' });
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalled();
  });
});
