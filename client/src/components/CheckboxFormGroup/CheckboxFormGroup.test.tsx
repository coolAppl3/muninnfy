import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import CheckboxFormGroup from './CheckboxFormGroup';
import { userEvent } from 'vitest/browser';

describe('CheckboxFormGroup', () => {
  it('should render a label with text', async () => {
    const { getByText } = await render(
      <CheckboxFormGroup
        label='someLabel'
        id='someId'
        isChecked={false}
        onClick={() => {}}
      />
    );

    const label = getByText('someLabel');
    await expect.element(label).toBeVisible();
  });

  it('should render a label with a react node', async () => {
    const { getByText } = await render(
      <CheckboxFormGroup
        label={<span>someSpan</span>}
        id='someId'
        isChecked={false}
        onClick={() => {}}
      />
    );

    const span = getByText('someSpan');
    await expect.element(span).toBeVisible();
  });

  it('should render a label with a for attribute matching the id prop', async () => {
    const { getByText } = await render(
      <CheckboxFormGroup
        label='someLabel'
        id='someId'
        isChecked={false}
        onClick={() => {}}
      />
    );

    const label = getByText('someLabel');
    await expect.element(label).toHaveAttribute('for', 'someId');
  });

  it('should render a button with a type attribute of button', async () => {
    const { getByRole } = await render(
      <CheckboxFormGroup
        label='someLabel'
        id='someId'
        isChecked={false}
        onClick={() => {}}
      />
    );

    const btn = getByRole('button');
    await expect.element(btn).toHaveAttribute('type', 'button');
  });

  it('should render a button with the id prop', async () => {
    const { getByRole } = await render(
      <CheckboxFormGroup
        label='someLabel'
        id='someId'
        isChecked={false}
        onClick={() => {}}
      />
    );

    const btn = getByRole('button');
    await expect.element(btn).toHaveAttribute('id', 'someId');
  });

  it('should render a button with a title and aria-label of Check if unchecked', async () => {
    const { getByRole } = await render(
      <CheckboxFormGroup
        label='someLabel'
        id='someId'
        isChecked={false}
        onClick={() => {}}
      />
    );

    const btn = getByRole('button');
    await expect.element(btn).toHaveAttribute('title', 'Check');
    await expect.element(btn).toHaveAttribute('aria-label', 'Check');
  });

  it('should render a button with a title and aria-label of Uncheck if checked', async () => {
    const { getByRole } = await render(
      <CheckboxFormGroup
        label='someLabel'
        id='someId'
        isChecked={true}
        onClick={() => {}}
      />
    );

    const btn = getByRole('button');
    await expect.element(btn).toHaveAttribute('title', 'Uncheck');
    await expect.element(btn).toHaveAttribute('aria-label', 'Uncheck');
  });

  it('should call onClick when clicked', async () => {
    const onClick = vi.fn();

    const { getByRole } = await render(
      <CheckboxFormGroup
        label='someLabel'
        id='someId'
        isChecked={false}
        onClick={onClick}
      />
    );

    const btn = getByRole('button');

    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalled();
  });
});
