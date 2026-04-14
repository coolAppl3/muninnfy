import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import DefaultFormGroup from './DefaultFormGroup';
import { userEvent } from 'vitest/browser';

describe('DefaultFormGroup', () => {
  describe('CheckboxFormGroup', () => {
    it('should render a label with text', async () => {
      const { getByText } = await render(
        <DefaultFormGroup
          id='someId'
          label='someLabel'
          value='someValue'
          errorMessage={null}
          onChange={() => {}}
          autoComplete='name'
        />
      );

      const label = getByText('someLabel');
      await expect.element(label).toBeVisible();
    });

    it('should render a label with a for attribute matching the id prop', async () => {
      const { getByText } = await render(
        <DefaultFormGroup
          id='someId'
          label='someLabel'
          value='someValue'
          errorMessage={null}
          onChange={() => {}}
          autoComplete='name'
        />
      );

      const label = getByText('someLabel');
      await expect.element(label).toHaveAttribute('for', 'someId');
    });

    it('should render a span with the errorMessage prop if it is not null', async () => {
      const { getByText } = await render(
        <DefaultFormGroup
          id='someId'
          label='someLabel'
          value='someValue'
          errorMessage={'someErrorMessage'}
          onChange={() => {}}
          autoComplete='name'
        />
      );

      const span = getByText('someErrorMessage');
      await expect.element(span).toBeVisible();
    });

    it('should render an input with a type of text', async () => {
      const { getByRole } = await render(
        <DefaultFormGroup
          id='someId'
          label='someLabel'
          value='someValue'
          errorMessage={null}
          onChange={() => {}}
          autoComplete='name'
        />
      );

      const input = getByRole('textbox', { name: 'someLabel' });
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
        onChange={() => {}}
        autoComplete='name'
      />
    );

    const input = getByRole('textbox', { name: 'someLabel' });
    await expect.element(input).toHaveAttribute('id', 'someId');
  });

  it('should render an input with the autoComplete prop', async () => {
    const { getByRole } = await render(
      <DefaultFormGroup
        id='someId'
        label='someLabel'
        value='someValue'
        errorMessage={null}
        onChange={() => {}}
        autoComplete='name'
      />
    );

    const input = getByRole('textbox', { name: 'someLabel' });
    await expect.element(input).toHaveAttribute('autocomplete', 'name');
  });

  it('should render an input with the placeholder prop as a placeholder if provided', async () => {
    const { getByRole } = await render(
      <DefaultFormGroup
        id='someId'
        label='someLabel'
        value='someValue'
        errorMessage={null}
        onChange={() => {}}
        autoComplete='name'
        placeholder='somePlaceholder'
      />
    );

    const input = getByRole('textbox', { name: 'someLabel' });
    await expect.element(input).toHaveAttribute('placeholder', 'somePlaceholder');
  });

  it('should cal the onChange handler when a change event is triggered in the input by the user', async () => {
    const onChange = vi.fn();

    const { getByRole } = await render(
      <DefaultFormGroup
        id='someId'
        label='someLabel'
        value='someValue'
        errorMessage={null}
        onChange={onChange}
        autoComplete='name'
        placeholder='somePlaceholder'
      />
    );

    const input = getByRole('textbox', { name: 'someLabel' });

    await userEvent.type(input, 'someText');
    expect(onChange).toHaveBeenCalled();
  });
});
