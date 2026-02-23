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
  | { type: 'resetFilters' }
  //
  | { type: 'setFilterByIsPurchased'; payload: { newValue: boolean | null } }
  | { type: 'setFilterByPrice'; payload: { newValue: boolean | null } }
  | { type: 'setFilterByLink'; payload: { newValue: boolean | null } }
  //
  | { type: 'setItemPriceRangeValid'; payload: { newValue: boolean } }
  | { type: 'setRequireAllFilterTags'; payload: { newValue: boolean } }
  //
  | { type: 'setAddedTimestampRange'; payload: { fromValue: number | null; toValue: number | null } }
  | { type: 'setPurchasedTimestampRange'; payload: { fromValue: number | null; toValue: number | null } }
  | { type: 'setItemPriceRange'; payload: { fromValue: number | null; toValue: number | null } }
  //
  | { type: 'setTagsSet'; payload: { newSet: Set<string> } };

export default function wishlistItemsToolbarFiltersReducer(
  state: WishlistItemsToolbarFiltersState,
  action: WishlistItemsToolbarFiltersReducerAction
): WishlistItemsToolbarFiltersState {
  if (action.type === 'resetFilters') {
    return { ...initialWishlistItemsToolbarFiltersState };
  }

  const { type, payload } = action;

  if (type === 'setFilterByIsPurchased') {
    const updatedState: WishlistItemsToolbarFiltersState = {
      ...state,
      filterByIsPurchased: payload.newValue,
    };

    return updatedState;
  }

  if (type === 'setFilterByPrice') {
    const updatedState: WishlistItemsToolbarFiltersState = {
      ...state,
      filterByPrice: payload.newValue,
      priceFrom: null,
      priceTo: null,
      priceRangeValid: true,
    };

    return updatedState;
  }

  if (type === 'setFilterByLink') {
    const updatedState: WishlistItemsToolbarFiltersState = {
      ...state,
      filterByLink: payload.newValue,
    };

    return updatedState;
  }

  if (type === 'setItemPriceRangeValid') {
    const updatedState: WishlistItemsToolbarFiltersState = {
      ...state,
      priceRangeValid: payload.newValue,
    };

    return updatedState;
  }

  if (type === 'setRequireAllFilterTags') {
    const updatedState: WishlistItemsToolbarFiltersState = {
      ...state,
      requireAllFilterTags: payload.newValue,
    };

    return updatedState;
  }

  if (type === 'setAddedTimestampRange') {
    const { fromValue, toValue } = payload;
    const updatedState: WishlistItemsToolbarFiltersState = {
      ...state,
      addedAfterTimestamp: fromValue,
      addedBeforeTimestamp: toValue,
    };

    return updatedState;
  }

  if (type === 'setPurchasedTimestampRange') {
    const { fromValue, toValue } = payload;
    const updatedState: WishlistItemsToolbarFiltersState = {
      ...state,
      purchasedAfterTimestamp: fromValue,
      purchasedBeforeTimestamp: toValue,
    };

    return updatedState;
  }

  if (type === 'setItemPriceRange') {
    const { fromValue, toValue } = payload;
    const updatedState: WishlistItemsToolbarFiltersState = {
      ...state,
      priceFrom: fromValue,
      priceTo: toValue,
    };

    return updatedState;
  }

  if (type === 'setTagsSet') {
    const updatedState: WishlistItemsToolbarFiltersState = {
      ...state,
      tagsSet: payload.newSet,
    };

    return updatedState;
  }

  return state;
}
