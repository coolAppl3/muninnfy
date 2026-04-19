import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import PasswordFormGroup from './PasswordFormGroup';
import { Locator, userEvent } from 'vitest/browser';

describe('PasswordFormGroup', () => {
  it('should render a label with the label prop text', async () => {
    const { getByText } = await render(
      <PasswordFormGroup
        id='someId'
        label='someLabel'
        value='someValue'
        errorMessage={null}
        onChange={vi.fn()}
      />
    );

    const label: Locator = getByText('someLabel');
    await expect.element(label).toBeVisible();
  });

  it('should render a label with a for attribute equal to the id prop', async () => {
    const { getByText } = await render(
      <PasswordFormGroup
        id='someId'
        label='someLabel'
        value='someValue'
        errorMessage={null}
        onChange={vi.fn()}
      />
    );

    const label: Locator = getByText('someLabel');
    await expect.element(label).toHaveAttribute('for', 'someId');
  });

  it('should render an input', async () => {
    const { getByRole } = await render(
      <PasswordFormGroup
        id='someId'
        label='someLabel'
        value='someValue'
        errorMessage={null}
        onChange={vi.fn()}
      />
    );

    const input: Locator = getByRole('textbox', { name: 'someLabel' });
    await expect.element(input).toBeVisible();
  });

  it('should render an input with a name attribute equal to the id prop', async () => {
    const { getByRole } = await render(
      <PasswordFormGroup
        id='someId'
        label='someLabel'
        value='someValue'
        errorMessage={null}
        onChange={vi.fn()}
      />
    );

    const input: Locator = getByRole('textbox', { name: 'someLabel' });
    await expect.element(input).toHaveAttribute('name', 'someId');
  });

  it('should render an input with an id attribute equal to the id prop', async () => {
    const { getByRole } = await render(
      <PasswordFormGroup
        id='someId'
        label='someLabel'
        value='someValue'
        errorMessage={null}
        onChange={vi.fn()}
      />
    );

    const input: Locator = getByRole('textbox', { name: 'someLabel' });
    await expect.element(input).toHaveAttribute('id', 'someId');
  });

  it('should render an input with an autocomplete attribute of current-password', async () => {
    const { getByRole } = await render(
      <PasswordFormGroup
        id='someId'
        label='someLabel'
        value='someValue'
        errorMessage={null}
        onChange={vi.fn()}
      />
    );

    const input: Locator = getByRole('textbox', { name: 'someLabel' });
    await expect.element(input).toHaveAttribute('autocomplete', 'current-password');
  });

  it('should render an input with the value of the value prop', async () => {
    const { getByRole } = await render(
      <PasswordFormGroup
        id='someId'
        label='someLabel'
        value='someValue'
        errorMessage={null}
        onChange={vi.fn()}
      />
    );

    const input: Locator = getByRole('textbox', { name: 'someLabel' });
    await expect.element(input).toHaveValue('someValue');
  });

  it('should render an input with a type of password by default', async () => {
    const { getByRole } = await render(
      <PasswordFormGroup
        id='someId'
        label='someLabel'
        value='someValue'
        errorMessage={null}
        onChange={vi.fn()}
      />
    );

    const input: Locator = getByRole('textbox', { name: 'someLabel' });
    await expect.element(input).toHaveAttribute('type', 'password');
  });

  it('should render an input with a type of text if the password toggle button is clicked once', async () => {
    const { getByRole } = await render(
      <PasswordFormGroup
        id='someId'
        label='someLabel'
        value='someValue'
        errorMessage={null}
        onChange={vi.fn()}
      />
    );

    const input: Locator = getByRole('textbox', { name: 'someLabel' });
    const btn: Locator = getByRole('button', { name: 'Reveal password' });

    await userEvent.click(btn);
    await expect.element(input).toHaveAttribute('type', 'text');
  });

  it('should call onClick when the input is changed by user action', async () => {
    const onChangeMock = vi.fn();

    const { getByRole } = await render(
      <PasswordFormGroup
        id='someId'
        label='someLabel'
        value='someValue'
        errorMessage={null}
        onChange={onChangeMock}
      />
    );

    const input: Locator = getByRole('textbox', { name: 'someLabel' });
    await userEvent.type(input, 'someText');
    expect(onChangeMock).toHaveBeenCalled();
  });

  it('should render a password toggle button with a title attribute of Reveal password by default', async () => {
    const { getByRole } = await render(
      <PasswordFormGroup
        id='someId'
        label='someLabel'
        value='someValue'
        errorMessage={null}
        onChange={vi.fn()}
      />
    );

    const btn: Locator = getByRole('button', { name: 'Reveal password' });
    await expect.element(btn).toHaveAttribute('title', 'Reveal password');
    await expect.element(btn).toBeVisible();
  });

  it('should render a password toggle button with a title attribute of Hide password if clicked once', async () => {
    const { getByRole } = await render(
      <PasswordFormGroup
        id='someId'
        label='someLabel'
        value='someValue'
        errorMessage={null}
        onChange={vi.fn()}
      />
    );

    const btn: Locator = getByRole('button', { name: 'Reveal password' });
    await expect.element(btn).toHaveAttribute('title', 'Reveal password');
    await userEvent.click(btn);

    const newBtn: Locator = getByRole('button', { name: 'Hide password' });
    await expect.element(newBtn).toHaveAttribute('title', 'Hide password');
  });

  it('should render a password toggle button with an aria-label attribute of Reveal password by default', async () => {
    const { getByRole } = await render(
      <PasswordFormGroup
        id='someId'
        label='someLabel'
        value='someValue'
        errorMessage={null}
        onChange={vi.fn()}
      />
    );

    const btn: Locator = getByRole('button', { name: 'Reveal password' });
    await expect.element(btn).toHaveAttribute('aria-label', 'Reveal password');
  });

  it('should render a password toggle button with an aria-label attribute of Hide password if clicked once', async () => {
    const { getByRole } = await render(
      <PasswordFormGroup
        id='someId'
        label='someLabel'
        value='someValue'
        errorMessage={null}
        onChange={vi.fn()}
      />
    );

    const btn: Locator = getByRole('button', { name: 'Reveal password' });
    await expect.element(btn).toHaveAttribute('aria-label', 'Reveal password');
    await userEvent.click(btn);

    const newBtn: Locator = getByRole('button', { name: 'Hide password' });
    await expect.element(newBtn).toHaveAttribute('title', 'Hide password');
  });

  it('should render a span with the errorMessage prop value if not null', async () => {
    const { getByText } = await render(
      <PasswordFormGroup
        id='someId'
        label='someLabel'
        value='someValue'
        errorMessage={'someErrorMessage'}
        onChange={vi.fn()}
      />
    );

    const span: Locator = getByText('someErrorMessage');
    await expect.element(span).toBeVisible();
  });
});
