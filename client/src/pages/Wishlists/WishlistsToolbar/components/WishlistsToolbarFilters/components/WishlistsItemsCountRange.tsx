import { ActionDispatch, ChangeEvent, JSX, useState } from 'react';
import DefaultFormGroup from '../../../../../../components/DefaultFormGroup/DefaultFormGroup';
import { WISHLIST_ITEMS_LIMIT } from '../../../../../../utils/constants/wishlistConstants';
import { WishlistsToolbarFiltersReducerAction } from '../wishlistsToolbarFiltersReducer';

type WishlistsItemsCountRangeProps = {
  dispatch: ActionDispatch<[action: WishlistsToolbarFiltersReducerAction]>;
  className?: string;
};

export default function WishlistsItemsCountRange({ dispatch, className }: WishlistsItemsCountRangeProps): JSX.Element {
  const [countFrom, setCountFrom] = useState<string>('');
  const [countTo, setCountTo] = useState<string>('');

  const [countFromErrorMessage, setCountFromErrorMessage] = useState<string | null>(null);
  const [countToErrorMessage, setCountToErrorMessage] = useState<string | null>(null);

  function validateRange(fromValue: string, toValue: string): void {
    const countFromErrorMessage: string | null = validateCount(fromValue);
    const countToErrorMessage: string | null = validateCount(toValue);

    setCountFromErrorMessage(countFromErrorMessage);
    setCountToErrorMessage(countToErrorMessage);

    if (countFromErrorMessage || countToErrorMessage) {
      dispatch({ type: 'SET_ITEMS_COUNT_RANGE_VALID', payload: { newValue: false } });
      return;
    }

    const finalCountFrom: number | null = fromValue === '' ? null : +fromValue;
    const finalCountTo: number | null = toValue === '' ? null : +toValue;

    if (finalCountFrom && finalCountTo && finalCountFrom > finalCountTo) {
      dispatch({ type: 'SET_ITEMS_COUNT_RANGE_VALID', payload: { newValue: false } });
      setCountToErrorMessage(`Can't be lower than the start of the range.`);

      return;
    }

    dispatch({ type: 'SET_ITEMS_COUNT', payload: { fromValue: finalCountFrom, toValue: finalCountTo } });
    dispatch({ type: 'SET_ITEMS_COUNT_RANGE_VALID', payload: { newValue: true } });
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
        value={countFrom}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const newValue: string = e.target.value;

          setCountFrom(newValue);
          validateRange(newValue, countTo);
        }}
      />

      <DefaultFormGroup
        id='item-price-to'
        label='To'
        autoComplete='off'
        errorMessage={countToErrorMessage}
        value={countTo}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const newValue: string = e.target.value;

          setCountTo(newValue);
          validateRange(countFrom, newValue);
        }}
      />
    </div>
  );
}
