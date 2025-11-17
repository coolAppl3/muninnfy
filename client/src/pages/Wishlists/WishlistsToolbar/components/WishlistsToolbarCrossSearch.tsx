import { ActionDispatch, JSX, useState } from 'react';
import DefaultFormGroup from '../../../../components/DefaultFormGroup/DefaultFormGroup';
import { validateWishlistTitle } from '../../../../utils/validation/wishlistValidation';

type WishlistsToolbarCrossSearchProps = {
  itemTitleQuery: string;
  itemTitleQueryErrorMessage: string | null;
  dispatch: ActionDispatch<[action: { type: 'SET_ITEM_TITLE_QUERY'; payload: { newValue: string } }]>;
};

export default function WishlistsToolbarCrossSearch({
  itemTitleQuery,
  itemTitleQueryErrorMessage,
  dispatch,
}: WishlistsToolbarCrossSearchProps): JSX.Element {
  return (
    <DefaultFormGroup
      id='cross-wishlists-search'
      label='Wishlist item title'
      autoComplete='off'
      value={itemTitleQuery}
      errorMessage={itemTitleQueryErrorMessage}
      onChange={(e) => dispatch({ type: 'SET_ITEM_TITLE_QUERY', payload: { newValue: e.target.value } })}
    />
  );
}
