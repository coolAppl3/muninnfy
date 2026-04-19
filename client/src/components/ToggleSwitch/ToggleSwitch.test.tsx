import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { Locator, userEvent } from 'vitest/browser';
import ToggleSwitch from './ToggleSwitch';

describe('ToggleSwitch', () => {
  it('should render a button', async () => {
    const { getByRole } = await render(
      <ToggleSwitch
        isToggled={false}
        onClick={vi.fn()}
      />
    );

    const btn: Locator = getByRole('button', { name: 'Enable' });
    await expect.element(btn).toBeVisible();
  });

  it('should render a button with a type of button', async () => {
    const { getByRole } = await render(
      <ToggleSwitch
        isToggled={false}
        onClick={vi.fn()}
      />
    );

    const btn: Locator = getByRole('button', { name: 'Enable' });
    await expect.element(btn).toHaveAttribute('type', 'button');
  });

  it('should render a button with a title and an aria-label of Enable if the isToggled prop is false', async () => {
    const { getByRole } = await render(
      <ToggleSwitch
        isToggled={false}
        onClick={vi.fn()}
      />
    );

    const btn: Locator = getByRole('button', { name: 'Enable' });
    await expect.element(btn).toHaveAttribute('title', 'Enable');
    await expect.element(btn).toHaveAttribute('aria-label', 'Enable');
  });

  it('should render a button with a title and an aria-label of Disable if the isToggled prop is true', async () => {
    const { getByRole } = await render(
      <ToggleSwitch
        isToggled={true}
        onClick={vi.fn()}
      />
    );

    const btn: Locator = getByRole('button', { name: 'Disable' });
    await expect.element(btn).toHaveAttribute('title', 'Disable');
    await expect.element(btn).toHaveAttribute('aria-label', 'Disable');
  });

  it('should render a button that calls onClick when clicked', async () => {
    const onClickMock = vi.fn();

    const { getByRole } = await render(
      <ToggleSwitch
        isToggled={false}
        onClick={onClickMock}
      />
    );

    const btn: Locator = getByRole('button', { name: 'Enable' });
    await userEvent.click(btn);
    expect(onClickMock).toHaveBeenCalled();
  });
});
