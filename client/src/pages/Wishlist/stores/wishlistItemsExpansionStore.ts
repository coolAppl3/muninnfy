import { useSyncExternalStore } from 'react';

const expandedItemsListeners = new Set<() => void>();
let expandedItemIdsSet = new Set<number>();

let allItemsExpanded: boolean = false;

function emit() {
  for (const listener of expandedItemsListeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  expandedItemsListeners.add(listener);
  return () => expandedItemsListeners.delete(listener);
}

export function toggleWishlistItemExpansion(itemId: number) {
  const newSet = new Set<number>(expandedItemIdsSet);
  newSet.has(itemId) ? newSet.delete(itemId) : newSet.add(itemId);

  expandedItemIdsSet = newSet;
  emit();
}

export function expandAllWishlistItems(itemIdsArr: number[]): void {
  expandedItemIdsSet = new Set<number>(itemIdsArr);
  allItemsExpanded = true;

  emit();
}

export function collapseAllWishlistItems(): void {
  expandedItemIdsSet = new Set<number>();
  allItemsExpanded = false;

  emit();
}

// hooks

export function useWishlistItemExpansion(itemId: number) {
  return useSyncExternalStore(subscribe, () => expandedItemIdsSet.has(itemId));
}

export function useWishlistItemsExpansionSet(): Set<number> {
  return useSyncExternalStore(subscribe, () => expandedItemIdsSet);
}
