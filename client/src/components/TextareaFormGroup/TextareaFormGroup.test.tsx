import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { Locator, userEvent } from 'vitest/browser';
import TextareaFormGroup from './TextareaFormGroup';

describe('TextareaFormGroup', () => {
  it('should render a label with the label prop text', async () => {
    const { getByText } = await render(
      <TextareaFormGroup
        id='someId'
        label='someLabel'
        value=''
        errorMessage={null}
        onChange={vi.fn()}
      />
    );

    const label: Locator = getByText('someLabel');
    await expect.element(label).toBeVisible();
  });

  it('should render a label with a for attribute equal to the id prop', async () => {
    const { getByText } = await render(
      <TextareaFormGroup
        id='someId'
        label='someLabel'
        value=''
        errorMessage={null}
        onChange={vi.fn()}
      />
    );

    const label: Locator = getByText('someLabel');
    await expect.element(label).toHaveAttribute('for', 'someId');
  });

  it('should render an error span with the value of the errorMessage prop if it is not null', async () => {
    const { getByText } = await render(
      <TextareaFormGroup
        id='someId'
        label='someLabel'
        value=''
        errorMessage='someError'
        onChange={vi.fn()}
      />
    );

    const span: Locator = getByText('someError');
    await expect.element(span).toBeVisible();
  });

  it('should render a textarea element with an id attribute equal to the id prop', async () => {
    const { getByRole } = await render(
      <TextareaFormGroup
        id='someId'
        label='someLabel'
        value=''
        errorMessage={null}
        onChange={vi.fn()}
      />
    );

    const textarea: Locator = getByRole('textbox', { name: 'someLabel' });
    await expect.element(textarea).toHaveAttribute('id', 'someId');
  });

  it('should render a textarea element with a name attribute equal to the id prop', async () => {
    const { getByRole } = await render(
      <TextareaFormGroup
        id='someId'
        label='someLabel'
        value=''
        errorMessage={null}
        onChange={vi.fn()}
      />
    );

    const textarea: Locator = getByRole('textbox', { name: 'someLabel' });
    await expect.element(textarea).toHaveAttribute('name', 'someId');
  });

  it('should render a textarea element with an autocomplete attribute equal to off', async () => {
    const { getByRole } = await render(
      <TextareaFormGroup
        id='someId'
        label='someLabel'
        value=''
        errorMessage={null}
        onChange={vi.fn()}
      />
    );

    const textarea: Locator = getByRole('textbox', { name: 'someLabel' });
    await expect.element(textarea).toHaveAttribute('autocomplete', 'off');
  });

  it('should call onChange when its value changes', async () => {
    const onChangeMock = vi.fn();

    const { getByRole } = await render(
      <TextareaFormGroup
        id='someId'
        label='someLabel'
        value=''
        errorMessage={null}
        onChange={onChangeMock}
      />
    );

    const textarea: Locator = getByRole('textbox', { name: 'someLabel' });
    await userEvent.type(textarea, 'someValue');

    expect(onChangeMock).toHaveBeenCalled();
  });
});
