import { ChangeEvent, JSX, useState } from 'react';
import DefaultFormGroup from '../DefaultFormGroup/DefaultFormGroup';
import { validatePrice } from '../../utils/validation/sharedValidation';

type PriceRangeFormGroupProps = {
  setRangeValue: (newRange: { fromValue: number | null; toValue: number | null }) => void;
  setRangeIsValid: (newValue: boolean) => void;
  maxPrice: number;
  className?: string;
};

export default function PriceRangeFormGroup({
  setRangeValue,
  setRangeIsValid,
  maxPrice,
  className,
}: PriceRangeFormGroupProps): JSX.Element {
  const [priceFrom, setLocalPriceFromValue] = useState<string>('');
  const [priceTo, setLocalPriceToValue] = useState<string>('');

  const [priceFromErrorMessage, setPriceFromErrorMessage] = useState<string | null>(null);
  const [priceToErrorMessage, setPriceToErrorMessage] = useState<string | null>(null);

  function validateRange(fromValue: string, toValue: string): void {
    const priceFromErrorMessage: string | null = validatePrice(fromValue, maxPrice);
    const priceToErrorMessage: string | null = validatePrice(toValue, maxPrice);

    setPriceFromErrorMessage(priceFromErrorMessage);
    setPriceToErrorMessage(priceToErrorMessage);

    if (priceFromErrorMessage || priceToErrorMessage) {
      setRangeIsValid(false);
      return;
    }

    const finalPriceFrom: number | null = fromValue === '' ? null : +fromValue;
    const finalPriceTo: number | null = toValue === '' ? null : +toValue;

    if (finalPriceFrom && finalPriceTo && finalPriceFrom > finalPriceTo) {
      setPriceToErrorMessage(`Can't be lower than the start of the range.`);
      setRangeIsValid(false);

      return;
    }

    setRangeValue({ fromValue: finalPriceFrom, toValue: finalPriceTo });
    setRangeIsValid(true);
  }

  return (
    <div className={`grid gap-1 items-start sm:gap-2 sm:grid-cols-2 ${className || ''}`}>
      <DefaultFormGroup
        id='item-price-from'
        label='Price from'
        autoComplete='off'
        errorMessage={priceFromErrorMessage}
        value={priceFrom}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const newValue: string = e.target.value;

          setLocalPriceFromValue(newValue);
          validateRange(newValue, priceTo);
        }}
      />

      <DefaultFormGroup
        id='item-price-to'
        label='Price to'
        autoComplete='off'
        errorMessage={priceToErrorMessage}
        value={priceTo}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const newValue: string = e.target.value;

          setLocalPriceToValue(newValue);
          validateRange(priceFrom, newValue);
        }}
      />
    </div>
  );
}
