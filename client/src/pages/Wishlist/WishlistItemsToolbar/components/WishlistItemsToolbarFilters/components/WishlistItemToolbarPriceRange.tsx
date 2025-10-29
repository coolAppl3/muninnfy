import { ChangeEvent, Dispatch, JSX, SetStateAction, useState } from 'react';
import DefaultFormGroup from '../../../../../../components/DefaultFormGroup/DefaultFormGroup';
import { validateWishlistItemPrice } from '../../../../../../utils/validation/wishlistItemValidation';

type WishlistItemToolbarPriceRangeProps = {
  setPriceFrom: Dispatch<SetStateAction<number | null>>;
  setPriceTo: Dispatch<SetStateAction<number | null>>;
  setPriceRangeValid: Dispatch<SetStateAction<boolean>>;
  className?: string;
};

export default function WishlistItemToolbarPriceRange({
  setPriceFrom,
  setPriceTo,
  setPriceRangeValid,
  className,
}: WishlistItemToolbarPriceRangeProps): JSX.Element {
  const [localPriceFromValue, setLocalPriceFromValue] = useState<string>('');
  const [localPriceToValue, setLocalPriceToValue] = useState<string>('');

  const [priceFromErrorMessage, setPriceFromErrorMessage] = useState<string | null>(null);
  const [priceToErrorMessage, setPriceToErrorMessage] = useState<string | null>(null);

  function validateRange(fromValue: string, toValue: string): void {
    const fromErrorMessage: string | null = validateWishlistItemPrice(fromValue);
    const toErrorMessage: string | null = validateWishlistItemPrice(toValue);

    setPriceFromErrorMessage(fromErrorMessage);
    setPriceToErrorMessage(toErrorMessage);

    if (fromErrorMessage || toErrorMessage) {
      setPriceRangeValid(false);
      return;
    }

    const fromNumberValue: number | null = fromValue === '' ? null : +fromValue;
    const toNumberValue: number | null = fromValue === '' ? null : +toValue;

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
