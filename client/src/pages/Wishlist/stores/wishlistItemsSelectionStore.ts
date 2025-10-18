import { useSyncExternalStore } from 'react';

const selectedItemsListeners = new Set<() => void>();
let selectedItemIdsSet = new Set<number>();

function emit() {
  for (const listener of selectedItemsListeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  selectedItemsListeners.add(listener);
  return () => selectedItemsListeners.delete(listener);
}

export function toggleWishlistItemSelection(itemId: number) {
  const newSet = new Set<number>(selectedItemIdsSet);
  newSet.has(itemId) ? newSet.delete(itemId) : newSet.add(itemId);

  selectedItemIdsSet = newSet;
  emit();
}

export function selectAllWishlistItems(itemIdsArr: number[]) {
  selectedItemIdsSet = new Set<number>(itemIdsArr);
  emit();
}

export function unselectAllWishlistItems() {
  selectedItemIdsSet = new Set<number>();
  emit();
}

// hooks

export function useWishlistItemSelected(itemId: number): boolean {
  return useSyncExternalStore(subscribe, () => selectedItemIdsSet.has(itemId));
}

export function useWishlistItemsSelectionSet(): Set<number> {
  return useSyncExternalStore(subscribe, () => selectedItemIdsSet);
}
