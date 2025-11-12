import { ChangeEvent, Dispatch, JSX, SetStateAction, useState } from 'react';
import DefaultFormGroup from '../DefaultFormGroup/DefaultFormGroup';
import { validatePrice } from '../../utils/validation/sharedValidation';

type PriceRangeFormGroupProps = {
  setPriceFrom: Dispatch<SetStateAction<number | null>>;
  setPriceTo: Dispatch<SetStateAction<number | null>>;
  setPriceRangeValid: Dispatch<SetStateAction<boolean>>;
  maxPrice: number;
  className?: string;
};

export default function PriceRangeFormGroup({
  setPriceFrom,
  setPriceTo,
  setPriceRangeValid,
  maxPrice,
  className,
}: PriceRangeFormGroupProps): JSX.Element {
  const [localPriceFromValue, setLocalPriceFromValue] = useState<string>('');
  const [localPriceToValue, setLocalPriceToValue] = useState<string>('');

  const [priceFromErrorMessage, setPriceFromErrorMessage] = useState<string | null>(null);
  const [priceToErrorMessage, setPriceToErrorMessage] = useState<string | null>(null);

  function validateRange(fromValue: string, toValue: string): void {
    const fromErrorMessage: string | null = validatePrice(fromValue, maxPrice);
    const toErrorMessage: string | null = validatePrice(toValue, maxPrice);

    setPriceFromErrorMessage(fromErrorMessage);
    setPriceToErrorMessage(toErrorMessage);

    if (fromErrorMessage || toErrorMessage) {
      setPriceRangeValid(false);
      return;
    }

    const fromNumberValue: number | null = fromValue === '' ? null : +fromValue;
    const toNumberValue: number | null = toValue === '' ? null : +toValue;

    setPriceFrom(fromNumberValue);
    setPriceTo(toNumberValue);

    if (!fromNumberValue || !toNumberValue) {
      setPriceRangeValid(true);
      return;
    }

    if (fromNumberValue > toNumberValue) {
      setPriceRangeValid(false);
      setPriceToErrorMessage(`Can't be lower than the start of the range.`);

      return;
    }

    setPriceRangeValid(true);
  }

  return (
    <div className={`grid gap-1 items-start sm:gap-2 sm:grid-cols-2 ${className || ''}`}>
      <DefaultFormGroup
        id='item-price-from'
        label='Price from'
        autoComplete='off'
        errorMessage={priceFromErrorMessage}
        value={localPriceFromValue}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const newValue: string = e.target.value;

          setLocalPriceFromValue(newValue);
          validateRange(newValue, localPriceToValue);
        }}
      />

      <DefaultFormGroup
        id='item-price-to'
        label='Price to'
        autoComplete='off'
        errorMessage={priceToErrorMessage}
        value={localPriceToValue}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const newValue: string = e.target.value;

          setLocalPriceToValue(newValue);
          validateRange(localPriceFromValue, newValue);
        }}
      />
    </div>
  );
}
