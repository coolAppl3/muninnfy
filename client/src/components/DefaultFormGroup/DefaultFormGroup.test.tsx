import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import DefaultFormGroup from './DefaultFormGroup';
import { Locator, userEvent } from 'vitest/browser';

describe('DefaultFormGroup', () => {
  describe('CheckboxFormGroup', () => {
    it('should render a label with the label prop text', async () => {
      const { getByText } = await render(
        <DefaultFormGroup
          id='someId'
          label='someLabel'
          value='someValue'
          errorMessage={null}
          onChange={vi.fn()}
          autoComplete='name'
        />
      );

      const label: Locator = getByText('someLabel');
      await expect.element(label).toBeVisible();
    });

    it('should render a label with a for attribute matching the id prop', async () => {
      const { getByText } = await render(
        <DefaultFormGroup
          id='someId'
          label='someLabel'
          value='someValue'
          errorMessage={null}
          onChange={vi.fn()}
          autoComplete='name'
        />
      );

      const label: Locator = getByText('someLabel');
      await expect.element(label).toHaveAttribute('for', 'someId');
    });

    it('should render a span with the errorMessage prop if it is not null', async () => {
      const { getByText } = await render(
        <DefaultFormGroup
          id='someId'
          label='someLabel'
          value='someValue'
          errorMessage={'someErrorMessage'}
          onChange={vi.fn()}
          autoComplete='name'
        />
      );

      const span: Locator = getByText('someErrorMessage');
      await expect.element(span).toBeVisible();
    });

    it('should render an input with a type of text', async () => {
      const { getByRole } = await render(
        <DefaultFormGroup
          id='someId'
          label='someLabel'
          value='someValue'
          errorMessage={null}
          onChange={vi.fn()}
          autoComplete='name'
        />
      );

      const input: Locator = getByRole('textbox', { name: 'someLabel' });
      await expect.element(input).toBeVisible();
    });
  });

  it('should render an input with the id prop', async () => {
    const { getByRole } = await render(
      <DefaultFormGroup
        id='someId'
        label='someLabel'
        value='someValue'
        errorMessage={null}
        onChange={vi.fn()}
        autoComplete='name'
      />
    );

    const input: Locator = getByRole('textbox', { name: 'someLabel' });
    await expect.element(input).toHaveAttribute('id', 'someId');
  });

  it('should render an input with the autoComplete prop', async () => {
    const { getByRole } = await render(
      <DefaultFormGroup
        id='someId'
        label='someLabel'
        value='someValue'
        errorMessage={null}
        onChange={vi.fn()}
        autoComplete='name'
      />
    );

    const input: Locator = getByRole('textbox', { name: 'someLabel' });
    await expect.element(input).toHaveAttribute('autocomplete', 'name');
  });

  it('should render an input with the placeholder prop as a placeholder if provided', async () => {
    const { getByRole } = await render(
      <DefaultFormGroup
        id='someId'
        label='someLabel'
        value='someValue'
        errorMessage={null}
        onChange={vi.fn()}
        autoComplete='name'
        placeholder='somePlaceholder'
      />
    );

    const input: Locator = getByRole('textbox', { name: 'someLabel' });
    await expect.element(input).toHaveAttribute('placeholder', 'somePlaceholder');
  });

  it('should cal the onChange handler when a change event is triggered in the input by the user', async () => {
    const onChangeMock = vi.fn();

    const { getByRole } = await render(
      <DefaultFormGroup
        id='someId'
        label='someLabel'
        value='someValue'
        errorMessage={null}
        onChange={onChangeMock}
        autoComplete='name'
        placeholder='somePlaceholder'
      />
    );

    const input: Locator = getByRole('textbox', { name: 'someLabel' });

    await userEvent.type(input, 'someText');
    expect(onChangeMock).toHaveBeenCalled();
  });
});
