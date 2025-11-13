import { ChangeEvent, Dispatch, JSX, SetStateAction, useState } from 'react';
import DefaultFormGroup from '../../../../../../components/DefaultFormGroup/DefaultFormGroup';
import { WISHLIST_ITEMS_LIMIT } from '../../../../../../utils/constants/wishlistConstants';

type WishlistsItemsCountRangeProps = {
  setCountFrom: Dispatch<SetStateAction<number | null>>;
  setCountTo: Dispatch<SetStateAction<number | null>>;
  setCountRangeValid: Dispatch<SetStateAction<boolean>>;
  className?: string;
};

export default function WishlistsItemsCountRange({
  setCountFrom,
  setCountTo,
  setCountRangeValid,
  className,
}: WishlistsItemsCountRangeProps): JSX.Element {
  const [localCountFrom, setLocalCountFrom] = useState<string>('');
  const [localCountTo, setLocalCountTo] = useState<string>('');

  const [countFromErrorMessage, setCountFromErrorMessage] = useState<string | null>(null);
  const [countToErrorMessage, setCountToErrorMessage] = useState<string | null>(null);

  function validateRange(fromValue: string, toValue: string): void {
    const fromErrorMessage: string | null = validateCount(fromValue);
    const toErrorMessage: string | null = validateCount(toValue);

    setCountFromErrorMessage(fromErrorMessage);
    setCountToErrorMessage(toErrorMessage);

    if (fromErrorMessage || toErrorMessage) {
      setCountRangeValid(false);
      return;
    }

    const fromNumberValue: number | null = fromValue === '' ? null : +fromValue;
    const toNumberValue: number | null = toValue === '' ? null : +toValue;

    setCountFrom(fromNumberValue);
    setCountTo(toNumberValue);

    if (!fromNumberValue || !toNumberValue) {
      setCountRangeValid(true);
      return;
    }

    if (fromNumberValue > toNumberValue) {
      setCountRangeValid(false);
      setCountToErrorMessage(`Can't be lower than the start of the range.`);

      return;
    }

    setCountRangeValid(true);
  }

  function validateCount(value: string): string | null {
    if (value === '') {
      return null;
    }

    const numberValue: number = +value;

    if (!Number.isInteger(numberValue)) {
      return 'Only valid integers are allowed.';
    }

    if (numberValue < 0) {
      return `Count can't be negative.`;
    }

    if (numberValue > WISHLIST_ITEMS_LIMIT) {
      return `Count can't exceed ${WISHLIST_ITEMS_LIMIT}.`;
    }

    return null;
  }

  return (
    <div className={`grid gap-1 items-start sm:gap-2 sm:grid-cols-2 ${className || ''}`}>
      <DefaultFormGroup
        id='item-price-from'
        label='From'
        autoComplete='off'
        errorMessage={countFromErrorMessage}
        value={localCountFrom}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const newValue: string = e.target.value;

          setLocalCountFrom(newValue);
          validateRange(newValue, localCountTo);
        }}
      />

      <DefaultFormGroup
        id='item-price-to'
        label='To'
        autoComplete='off'
        errorMessage={countToErrorMessage}
        value={localCountTo}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const newValue: string = e.target.value;

          setLocalCountTo(newValue);
          validateRange(localCountFrom, newValue);
        }}
      />
    </div>
  );
}
