import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import FilterTogglerCheckboxBtn from './FilterTogglerCheckboxBtn';
import { Locator, userEvent } from 'vitest/browser';

describe('FilterTogglerCheckboxBtn', () => {
  it('should render a span with the title prop', async () => {
    const { getByText } = await render(
      <FilterTogglerCheckboxBtn
        title='someTitle'
        isChecked={true}
        onClick={vi.fn()}
      />
    );

    const span: Locator = getByText('someTitle');
    await expect.element(span).toBeVisible();
  });

  it('should render a button with type of button', async () => {
    const { getByRole } = await render(
      <FilterTogglerCheckboxBtn
        title='someTitle'
        isChecked={true}
        onClick={vi.fn()}
      />
    );

    const btn: Locator = getByRole('button');
    await expect.element(btn).toBeVisible();
  });

  it('should call onClick when the button is clicked', async () => {
    const onClick = vi.fn();

    const { getByRole } = await render(
      <FilterTogglerCheckboxBtn
        title='someTitle'
        isChecked={true}
        onClick={onClick}
      />
    );

    const btn: Locator = getByRole('button');

    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalled();
  });
});
