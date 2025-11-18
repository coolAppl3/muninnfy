type WishlistItemsToolbarFiltersState = {
  addedAfterTimestamp: number | null;
  addedBeforeTimestamp: number | null;

  purchasedAfterTimestamp: number | null;
  purchasedBeforeTimestamp: number | null;

  priceFrom: number | null;
  priceTo: number | null;
  priceRangeValid: boolean;

  filterByIsPurchased: boolean | null;
  filterByPrice: boolean | null;
  filterByLink: boolean | null;

  tagsSet: Set<string>;
  requireAllFilterTags: boolean;
};

export const initialWishlistItemsToolbarFiltersState: WishlistItemsToolbarFiltersState = {
  addedAfterTimestamp: null,
  addedBeforeTimestamp: null,

  purchasedAfterTimestamp: null,
  purchasedBeforeTimestamp: null,

  priceFrom: null,
  priceTo: null,
  priceRangeValid: true,

  filterByIsPurchased: null,
  filterByPrice: null,
  filterByLink: null,

  tagsSet: new Set<string>(),
  requireAllFilterTags: false,
};

export type WishlistItemsToolbarFiltersReducerAction =
  | { type: 'RESET_FILTERS' }
  //
  | { type: 'SET_ADDED_TIMESTAMP'; payload: { fromValue: number | null; toValue: number | null } }
  | { type: 'SET_PURCHASED_TIMESTAMP'; payload: { fromValue: number | null; toValue: number | null } }
  | { type: 'SET_ITEM_PRICE'; payload: { fromValue: number | null; toValue: number | null } }
  //
  | { type: 'SET_ITEM_PRICE_RANGE_VALID'; payload: { newValue: boolean } }
  //
  | { type: 'SET_FILTER_BY_IS_PURCHASED'; payload: { newValue: boolean | null } }
  | { type: 'SET_FILTER_BY_PRICE'; payload: { newValue: boolean | null } }
  | { type: 'SET_FILTER_BY_LINK'; payload: { newValue: boolean | null } }
  //
  | { type: 'SET_TAGS_SET'; payload: { newSet: Set<string> } }
  | { type: 'SET_REQUIRE_ALL_FILTER_TAGS'; payload: { newValue: boolean } };

export default function wishlistItemsToolbarFiltersReducer(
  state: WishlistItemsToolbarFiltersState,
  action: WishlistItemsToolbarFiltersReducerAction
): WishlistItemsToolbarFiltersState {
  if (action.type === 'RESET_FILTERS') {
    return { ...initialWishlistItemsToolbarFiltersState };
  }

  const { type, payload } = action;

  if (type === 'SET_ADDED_TIMESTAMP') {
    const { fromValue, toValue } = payload;
    const updatedState: WishlistItemsToolbarFiltersState = {
      ...state,
      addedAfterTimestamp: fromValue,
      addedBeforeTimestamp: toValue,
    };

    return updatedState;
  }

  if (type === 'SET_PURCHASED_TIMESTAMP') {
    const { fromValue, toValue } = payload;
    const updatedState: WishlistItemsToolbarFiltersState = {
      ...state,
      purchasedAfterTimestamp: fromValue,
      purchasedBeforeTimestamp: toValue,
    };

    return updatedState;
  }

  if (type === 'SET_ITEM_PRICE') {
    const { fromValue, toValue } = payload;
    const updatedState: WishlistItemsToolbarFiltersState = {
      ...state,
      priceFrom: fromValue,
      priceTo: toValue,
    };

    return updatedState;
  }

  if (type === 'SET_ITEM_PRICE_RANGE_VALID') {
    const updatedState: WishlistItemsToolbarFiltersState = {
      ...state,
      priceRangeValid: payload.newValue,
    };

    return updatedState;
  }

  if (type === 'SET_FILTER_BY_IS_PURCHASED') {
    const updatedState: WishlistItemsToolbarFiltersState = {
      ...state,
      filterByIsPurchased: payload.newValue,
    };

    return updatedState;
  }

  if (type === 'SET_FILTER_BY_PRICE') {
    const updatedState: WishlistItemsToolbarFiltersState = {
      ...state,
      filterByPrice: payload.newValue,
      priceFrom: null,
      priceTo: null,
      priceRangeValid: true,
    };

    return updatedState;
  }

  if (type === 'SET_FILTER_BY_LINK') {
    const updatedState: WishlistItemsToolbarFiltersState = {
      ...state,
      filterByLink: payload.newValue,
    };

    return updatedState;
  }

  if (type === 'SET_TAGS_SET') {
    const updatedState: WishlistItemsToolbarFiltersState = {
      ...state,
      tagsSet: payload.newSet,
    };

    return updatedState;
  }

  if (type === 'SET_REQUIRE_ALL_FILTER_TAGS') {
    const updatedState: WishlistItemsToolbarFiltersState = {
      ...state,
      requireAllFilterTags: payload.newValue,
    };

    return updatedState;
  }

  return state;
}
