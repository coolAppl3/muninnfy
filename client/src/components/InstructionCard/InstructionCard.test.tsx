import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import InstructionCard from './InstructionCard';
import { Locator, userEvent } from 'vitest/browser';

describe('InstructionCard', () => {
  it('should render a heading with the title prop', async () => {
    const { getByText } = await render(
      <InstructionCard
        title='someTitle'
        description='someDescription'
        btnTitle='someBtnTitle'
        btnDisabled={false}
        onClick={vi.fn()}
      />
    );

    const heading: Locator = getByText('someTitle');
    await expect.element(heading).toBeVisible();
  });

  it('should render a paragraph with the description prop', async () => {
    const { getByText } = await render(
      <InstructionCard
        title='someTitle'
        description='someDescription'
        btnTitle='someBtnTitle'
        btnDisabled={false}
        onClick={vi.fn()}
      />
    );

    const paragraph: Locator = getByText('someDescription');
    await expect.element(paragraph).toBeVisible();
  });

  it('should render a button with the btnTitle prop', async () => {
    const { getByRole } = await render(
      <InstructionCard
        title='someTitle'
        description='someDescription'
        btnTitle='someBtnTitle'
        btnDisabled={false}
        onClick={vi.fn()}
      />
    );

    const btn: Locator = getByRole('button', { name: 'someBtnTitle' });
    await expect.element(btn).toBeVisible();
  });

  it('should render a working button if the disabled prop is false', async () => {
    const { getByRole } = await render(
      <InstructionCard
        title='someTitle'
        description='someDescription'
        btnTitle='someBtnTitle'
        btnDisabled={false}
        onClick={vi.fn()}
      />
    );

    const btn: Locator = getByRole('button', { name: 'someBtnTitle' });
    await expect.element(btn).toBeVisible();
    await expect.element(btn).not.toBeDisabled();
  });

  it('should render a disabled button if the disabled prop is true', async () => {
    const { getByRole } = await render(
      <InstructionCard
        title='someTitle'
        description='someDescription'
        btnTitle='someBtnTitle'
        btnDisabled={true}
        onClick={vi.fn()}
      />
    );

    const btn: Locator = getByRole('button', { name: 'someBtnTitle' });
    await expect.element(btn).toBeVisible();
    await expect.element(btn).toBeDisabled();
  });

  it('should call onClick when the button is clicked', async () => {
    const onClickMock = vi.fn();

    const { getByRole } = await render(
      <InstructionCard
        title='someTitle'
        description='someDescription'
        btnTitle='someBtnTitle'
        btnDisabled={false}
        onClick={onClickMock}
      />
    );

    const btn: Locator = getByRole('button', { name: 'someBtnTitle' });
    await userEvent.click(btn);
    expect(onClickMock).toHaveBeenCalled();
  });
});
