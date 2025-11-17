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
  | { type: 'RESET_FILTERS' }
  //
  | { type: 'SET_CREATED_TIMESTAMP'; payload: { fromValue: number | null; toValue: number | null } }
  | { type: 'SET_ITEMS_COUNT'; payload: { fromValue: number | null; toValue: number | null } }
  | { type: 'SET_TOTAL_ITEMS_PRICE'; payload: { fromValue: number | null; toValue: number | null } }
  | { type: 'SET_PRICE_TO_COMPLETE'; payload: { fromValue: number | null; toValue: number | null } }
  | { type: 'SET_ITEM_TITLE_QUERY'; payload: { newValue: string } }
  //
  | { type: 'SET_FILTER_BY_ITEMS_COUNT'; payload: { newValue: boolean } }
  | { type: 'SET_FILTER_BY_TOTAL_ITEMS_PRICE'; payload: { newValue: boolean } }
  | { type: 'SET_FILTER_BY_PRICE_TO_COMPLETE'; payload: { newValue: boolean } }
  | { type: 'SET_FILTER_BY_ITEM_TITLE'; payload: { newValue: boolean } }
  //
  | { type: 'SET_ITEMS_COUNT_RANGE_VALID'; payload: { newValue: boolean } }
  | { type: 'SET_TOTAL_ITEMS_PRICE_RANGE_VALID'; payload: { newValue: boolean } }
  | { type: 'SET_PRICE_TO_COMPLETE_RANGE_VALID'; payload: { newValue: boolean } }
  | { type: 'SET_ITEM_TITLE_QUERY_ERROR_MESSAGE'; payload: { newValue: string | null } };

export default function wishlistsToolbarFiltersReducer(
  state: WishlistsToolbarFiltersState,
  action: WishlistsToolbarFiltersReducerAction
): WishlistsToolbarFiltersState {
  if (action.type === 'RESET_FILTERS') {
    return { ...initialWishlistsToolbarFiltersState };
  }

  const { type, payload } = action;

  if (type === 'SET_CREATED_TIMESTAMP') {
    const { fromValue, toValue } = payload;
    const updatedState: WishlistsToolbarFiltersState = {
      ...state,
      createdAfterTimestamp: fromValue,
      createdBeforeTimestamp: toValue,
    };

    return updatedState;
  }

  if (type === 'SET_ITEMS_COUNT') {
    const { fromValue, toValue } = payload;
    const updatedState: WishlistsToolbarFiltersState = {
      ...state,
      itemsCountFrom: fromValue,
      itemsCountTo: toValue,
    };

    return updatedState;
  }

  if (type === 'SET_TOTAL_ITEMS_PRICE') {
    const { fromValue, toValue } = payload;
    const updatedState: WishlistsToolbarFiltersState = {
      ...state,
      totalItemsPriceFrom: fromValue,
      totalItemsPriceTo: toValue,
    };

    return updatedState;
  }

  if (type === 'SET_PRICE_TO_COMPLETE') {
    const { fromValue, toValue } = payload;
    const updatedState: WishlistsToolbarFiltersState = {
      ...state,
      priceToCompleteFrom: fromValue,
      priceToCompleteTo: toValue,
    };

    return updatedState;
  }

  if (type === 'SET_ITEM_TITLE_QUERY') {
    const updatedState: WishlistsToolbarFiltersState = {
      ...state,
      itemTitleQuery: payload.newValue,
      itemTitleQueryErrorMessage: payload.newValue === '' ? null : validateWishlistItemTitle(payload.newValue),
    };

    return updatedState;
  }

  if (type === 'SET_FILTER_BY_ITEMS_COUNT') {
    const updatedState: WishlistsToolbarFiltersState = {
      ...state,
      filterByItemsCount: payload.newValue,
      itemsCountFrom: null,
      itemsCountTo: null,
      itemsCountRangeValid: true,
    };

    return updatedState;
  }

  if (type === 'SET_FILTER_BY_TOTAL_ITEMS_PRICE') {
    const updatedState: WishlistsToolbarFiltersState = {
      ...state,
      filterByTotalItemsPrice: payload.newValue,
      totalItemsPriceFrom: null,
      totalItemsPriceTo: null,
      totalItemsPriceRangeValid: true,
    };

    return updatedState;
  }

  if (type === 'SET_FILTER_BY_PRICE_TO_COMPLETE') {
    const updatedState: WishlistsToolbarFiltersState = {
      ...state,
      filterByPriceToComplete: payload.newValue,
      priceToCompleteFrom: null,
      priceToCompleteTo: null,
      priceToCompleteRangeValid: true,
    };

    return updatedState;
  }

  if (type === 'SET_FILTER_BY_ITEM_TITLE') {
    const updatedState: WishlistsToolbarFiltersState = {
      ...state,
      filterByItemTitle: payload.newValue,
      itemTitleQuery: '',
      itemTitleQueryErrorMessage: '',
    };

    return updatedState;
  }

  if (type === 'SET_ITEMS_COUNT_RANGE_VALID') {
    const updatedState: WishlistsToolbarFiltersState = {
      ...state,
      itemsCountRangeValid: payload.newValue,
    };

    return updatedState;
  }

  if (type === 'SET_TOTAL_ITEMS_PRICE_RANGE_VALID') {
    const updatedState: WishlistsToolbarFiltersState = {
      ...state,
      totalItemsPriceRangeValid: payload.newValue,
    };

    return updatedState;
  }

  if (type === 'SET_PRICE_TO_COMPLETE_RANGE_VALID') {
    const updatedState: WishlistsToolbarFiltersState = {
      ...state,
      priceToCompleteRangeValid: payload.newValue,
    };

    return updatedState;
  }

  if (type === 'SET_ITEM_TITLE_QUERY_ERROR_MESSAGE') {
    const updatedState: WishlistsToolbarFiltersState = {
      ...state,
      itemTitleQueryErrorMessage: payload.newValue,
    };

    return updatedState;
  }

  return state;
}
