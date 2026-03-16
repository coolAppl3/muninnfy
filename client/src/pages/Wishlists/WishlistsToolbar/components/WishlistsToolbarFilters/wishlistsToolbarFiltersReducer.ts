import { validateWishlistItemTitle } from '../../../../../utils/validation/wishlistItemValidation';

type WishlistsToolbarFiltersState = {
  createdAfterTimestamp: number | null;
  createdBeforeTimestamp: number | null;

  itemsCountFrom: number | null;
  itemsCountTo: number | null;

  totalItemsPriceFrom: number | null;
  totalItemsPriceTo: number | null;

  priceToCompleteFrom: number | null;
  priceToCompleteTo: number | null;

  isFavorited: boolean | null;

  itemTitleQuery: string;
  itemTitleQueryErrorMessage: string | null;

  filterByItemsCount: boolean;
  filterByTotalItemsPrice: boolean;
  filterByPriceToComplete: boolean;
  filterByItemTitle: boolean;

  itemsCountRangeValid: boolean;
  totalItemsPriceRangeValid: boolean;
  priceToCompleteRangeValid: boolean;
  itemTitleQueryValid: boolean;
};

export const initialWishlistsToolbarFiltersState: WishlistsToolbarFiltersState = {
  createdAfterTimestamp: null,
  createdBeforeTimestamp: null,

  itemsCountFrom: null,
  itemsCountTo: null,

  totalItemsPriceFrom: null,
  totalItemsPriceTo: null,

  priceToCompleteFrom: null,
  priceToCompleteTo: null,

  isFavorited: null,

  itemTitleQuery: '',
  itemTitleQueryErrorMessage: null,

  filterByItemsCount: false,
  filterByTotalItemsPrice: false,
  filterByPriceToComplete: false,
  filterByItemTitle: false,

  itemsCountRangeValid: true,
  totalItemsPriceRangeValid: true,
  priceToCompleteRangeValid: true,
  itemTitleQueryValid: true,
};

export type WishlistsToolbarFiltersReducerAction =
  | { type: 'resetFilters' }
  //
  | { type: 'setCreatedTimestampRange'; payload: { fromValue: number | null; toValue: number | null } }
  | { type: 'setItemsCountRange'; payload: { fromValue: number | null; toValue: number | null } }
  | { type: 'setTotalItemsPriceRange'; payload: { fromValue: number | null; toValue: number | null } }
  | { type: 'setPriceToCompleteRange'; payload: { fromValue: number | null; toValue: number | null } }
  //
  | { type: 'setItemTitleQuery'; payload: { newValue: string } }
  | { type: 'setIsFavorited'; payload: { newValue: boolean | null } }
  //
  | { type: 'setFilterByItemsCount'; payload: { newValue: boolean } }
  | { type: 'setFilterByTotalItemsPrice'; payload: { newValue: boolean } }
  | { type: 'setFilterByPriceToComplete'; payload: { newValue: boolean } }
  | { type: 'setFilterByItemTitle'; payload: { newValue: boolean } }
  //
  | { type: 'setItemsCountRangeValid'; payload: { newValue: boolean } }
  | { type: 'setTotalItemsPriceRangeValid'; payload: { newValue: boolean } }
  | { type: 'setPriceToCompleteRangeValid'; payload: { newValue: boolean } }
  | { type: 'setItemTitleQueryErrorMessage'; payload: { newValue: string | null } };

export default function wishlistsToolbarFiltersReducer(
  state: WishlistsToolbarFiltersState,
  action: WishlistsToolbarFiltersReducerAction
): WishlistsToolbarFiltersState {
  if (action.type === 'resetFilters') {
    return { ...initialWishlistsToolbarFiltersState };
  }

  const { type, payload } = action;

  if (type === 'setCreatedTimestampRange') {
    const { fromValue, toValue } = payload;
    const updatedState: WishlistsToolbarFiltersState = {
      ...state,
      createdAfterTimestamp: fromValue,
      createdBeforeTimestamp: toValue,
    };

    return updatedState;
  }

  if (type === 'setItemsCountRange') {
    const { fromValue, toValue } = payload;
    const updatedState: WishlistsToolbarFiltersState = {
      ...state,
      itemsCountFrom: fromValue,
      itemsCountTo: toValue,
    };

    return updatedState;
  }

  if (type === 'setTotalItemsPriceRange') {
    const { fromValue, toValue } = payload;
    const updatedState: WishlistsToolbarFiltersState = {
      ...state,
      totalItemsPriceFrom: fromValue,
      totalItemsPriceTo: toValue,
    };

    return updatedState;
  }

  if (type === 'setPriceToCompleteRange') {
    const { fromValue, toValue } = payload;
    const updatedState: WishlistsToolbarFiltersState = {
      ...state,
      priceToCompleteFrom: fromValue,
      priceToCompleteTo: toValue,
    };

    return updatedState;
  }

  if (type === 'setItemTitleQuery') {
    const updatedState: WishlistsToolbarFiltersState = {
      ...state,
      itemTitleQuery: payload.newValue.trimEnd(),
      itemTitleQueryErrorMessage: payload.newValue === '' ? null : validateWishlistItemTitle(payload.newValue),
    };

    return updatedState;
  }

  if (type === 'setIsFavorited') {
    const updatedState: WishlistsToolbarFiltersState = {
      ...state,
      isFavorited: payload.newValue,
    };

    return updatedState;
  }

  if (type === 'setFilterByItemsCount') {
    const updatedState: WishlistsToolbarFiltersState = {
      ...state,
      filterByItemsCount: payload.newValue,
      itemsCountFrom: null,
      itemsCountTo: null,
      itemsCountRangeValid: true,
    };

    return updatedState;
  }

  if (type === 'setFilterByTotalItemsPrice') {
    const updatedState: WishlistsToolbarFiltersState = {
      ...state,
      filterByTotalItemsPrice: payload.newValue,
      totalItemsPriceFrom: null,
      totalItemsPriceTo: null,
      totalItemsPriceRangeValid: true,
    };

    return updatedState;
  }

  if (type === 'setFilterByPriceToComplete') {
    const updatedState: WishlistsToolbarFiltersState = {
      ...state,
      filterByPriceToComplete: payload.newValue,
      priceToCompleteFrom: null,
      priceToCompleteTo: null,
      priceToCompleteRangeValid: true,
    };

    return updatedState;
  }

  if (type === 'setFilterByItemTitle') {
    const updatedState: WishlistsToolbarFiltersState = {
      ...state,
      filterByItemTitle: payload.newValue,
      itemTitleQuery: '',
      itemTitleQueryErrorMessage: '',
    };

    return updatedState;
  }

  if (type === 'setItemsCountRangeValid') {
    const updatedState: WishlistsToolbarFiltersState = {
      ...state,
      itemsCountRangeValid: payload.newValue,
    };

    return updatedState;
  }

  if (type === 'setTotalItemsPriceRangeValid') {
    const updatedState: WishlistsToolbarFiltersState = {
      ...state,
      totalItemsPriceRangeValid: payload.newValue,
    };

    return updatedState;
  }

  if (type === 'setPriceToCompleteRangeValid') {
    const updatedState: WishlistsToolbarFiltersState = {
      ...state,
      priceToCompleteRangeValid: payload.newValue,
    };

    return updatedState;
  }

  if (type === 'setItemTitleQueryErrorMessage') {
    const updatedState: WishlistsToolbarFiltersState = {
      ...state,
      itemTitleQueryErrorMessage: payload.newValue,
    };

    return updatedState;
  }

  return state;
}
