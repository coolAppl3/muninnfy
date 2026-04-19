import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { Locator, userEvent } from 'vitest/browser';
import PriceRangeFormGroup from './PriceRangeFormGroup';
import * as sharedValidation from '../../utils/validation/sharedValidation';

vi.mock('../../utils/validation/sharedValidation', { spy: true });

describe('PriceRangeFormGroup', () => {
  it('should render a price from label with the text of Price from', async () => {
    const { getByText } = await render(
      <PriceRangeFormGroup
        setRangeValue={vi.fn()}
        setRangeIsValid={vi.fn()}
        maxPrice={2000}
      />
    );

    const label: Locator = getByText('Price from');
    await expect.element(label).toBeVisible();
    await expect.element(label).toHaveAttribute('for', 'item-price-from');
  });

  it('should render a price from input', async () => {
    const { getByRole } = await render(
      <PriceRangeFormGroup
        setRangeValue={vi.fn()}
        setRangeIsValid={vi.fn()}
        maxPrice={2000}
      />
    );

    const input: Locator = getByRole('textbox', { name: 'Price from' });
    await expect.element(input).toHaveAttribute('type', 'text');
    await expect.element(input).toHaveAttribute('id', 'item-price-from');
    await expect.element(input).toHaveAttribute('name', 'item-price-from');
  });

  it('should render a price to label with the text of Price to', async () => {
    const { getByText } = await render(
      <PriceRangeFormGroup
        setRangeValue={vi.fn()}
        setRangeIsValid={vi.fn()}
        maxPrice={2000}
      />
    );

    const label: Locator = getByText('Price to');
    await expect.element(label).toBeVisible();
    await expect.element(label).toHaveAttribute('for', 'item-price-to');
  });

  it('should render a price to input', async () => {
    const { getByRole } = await render(
      <PriceRangeFormGroup
        setRangeValue={vi.fn()}
        setRangeIsValid={vi.fn()}
        maxPrice={2000}
      />
    );

    const input: Locator = getByRole('textbox', { name: 'Price to' });
    await expect.element(input).toHaveAttribute('type', 'text');
    await expect.element(input).toHaveAttribute('id', 'item-price-to');
    await expect.element(input).toHaveAttribute('name', 'item-price-to');
  });

  it('should call validatePrice and render en error span with the error message if an invalid price from value is provided', async () => {
    const { getByRole, getByText } = await render(
      <PriceRangeFormGroup
        setRangeValue={vi.fn()}
        setRangeIsValid={vi.fn()}
        maxPrice={2000}
      />
    );

    const input: Locator = getByRole('textbox', { name: 'Price from' });
    await userEvent.type(input, 'invalidValue');

    expect(sharedValidation.validatePrice).toHaveBeenCalled();

    const span: Locator = getByText('Price must be a valid number.');
    await expect.element(span).toBeVisible();
  });

  it('should call validatePrice and render en error span with the error message if an invalid price to value is provided', async () => {
    const { getByRole, getByText } = await render(
      <PriceRangeFormGroup
        setRangeValue={vi.fn()}
        setRangeIsValid={vi.fn()}
        maxPrice={2000}
      />
    );

    const input: Locator = getByRole('textbox', { name: 'Price to' });
    await userEvent.type(input, 'invalidValue');

    expect(sharedValidation.validatePrice).toHaveBeenCalled();

    const span: Locator = getByText('Price must be a valid number.');
    await expect.element(span).toBeVisible();
  });

  it('should render an error span and give our an error message if the price from value is larger than the price to value', async () => {
    const { getByRole, getByText } = await render(
      <PriceRangeFormGroup
        setRangeValue={vi.fn()}
        setRangeIsValid={vi.fn()}
        maxPrice={2000}
      />
    );

    const fromInput: Locator = getByRole('textbox', { name: 'Price from' });
    const toInput: Locator = getByRole('textbox', { name: 'Price to' });

    await userEvent.type(fromInput, '100');
    await userEvent.type(toInput, '50');

    const span: Locator = getByText(`Can't be lower than the start of the range.`);
    await expect.element(span).toBeVisible();
  });

  it('should render an error span and give our an error message if either ends of the price range are larger than the maxPrice prop', async () => {
    const { getByRole, getByText } = await render(
      <PriceRangeFormGroup
        setRangeValue={vi.fn()}
        setRangeIsValid={vi.fn()}
        maxPrice={2000}
      />
    );

    const fromInput: Locator = getByRole('textbox', { name: 'Price from' });
    const toInput: Locator = getByRole('textbox', { name: 'Price to' });

    await userEvent.type(fromInput, '3000');
    await userEvent.type(toInput, '50');

    const span: Locator = getByText(`Price can't exceed 2,000.00`);
    await expect.element(span).toBeVisible();
  });

  it('should call setRangeValue with the range values if valid price from and to values are entered', async () => {
    const setRangeValueMock = vi.fn();

    const { getByRole } = await render(
      <PriceRangeFormGroup
        setRangeValue={setRangeValueMock}
        setRangeIsValid={vi.fn()}
        maxPrice={2000}
      />
    );

    const fromInput: Locator = getByRole('textbox', { name: 'Price from' });
    const toInput: Locator = getByRole('textbox', { name: 'Price to' });

    await userEvent.type(fromInput, '100');
    await userEvent.type(toInput, '200');

    expect(setRangeValueMock).toHaveBeenCalledWith({ fromValue: 100, toValue: 200 });
  });

  it('should call setRangeIsValid with true if valid price from and to values are entered', async () => {
    const setRangeIsValidMock = vi.fn();

    const { getByRole } = await render(
      <PriceRangeFormGroup
        setRangeValue={vi.fn()}
        setRangeIsValid={setRangeIsValidMock}
        maxPrice={2000}
      />
    );

    const fromInput: Locator = getByRole('textbox', { name: 'Price from' });
    const toInput: Locator = getByRole('textbox', { name: 'Price to' });

    await userEvent.type(fromInput, '100');
    await userEvent.type(toInput, '200');

    expect(setRangeIsValidMock).toHaveBeenCalledWith(true);
  });

  it('should call setRangeIsValid with false if invalid price from and to values are entered', async () => {
    const setRangeIsValidMock = vi.fn();

    const { getByRole } = await render(
      <PriceRangeFormGroup
        setRangeValue={vi.fn()}
        setRangeIsValid={setRangeIsValidMock}
        maxPrice={2000}
      />
    );

    const fromInput: Locator = getByRole('textbox', { name: 'Price from' });
    const toInput: Locator = getByRole('textbox', { name: 'Price to' });

    await userEvent.type(fromInput, 'invalid');
    await userEvent.type(toInput, '200');

    expect(setRangeIsValidMock).toHaveBeenCalledWith(false);
  });
});
