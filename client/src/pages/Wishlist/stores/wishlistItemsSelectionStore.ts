import { create } from 'zustand';

type WishlistItemsSelectionStoreType = {
  selectedItemsIdsSet: Set<number>;

  selectAllWishlistItems: (itemIdsArr: number[]) => void;
  unselectAllWishlistItems: () => void;
  toggleWishlistItemSelection: (itemId: number) => void;
};

export const useWishlistItemsSelectionStore = create<WishlistItemsSelectionStoreType>((set, get) => ({
  selectedItemsIdsSet: new Set<number>(),

  selectAllWishlistItems: (itemIdsArr: number[]) => set({ selectedItemsIdsSet: new Set<number>(itemIdsArr) }),
  unselectAllWishlistItems: () => set({ selectedItemsIdsSet: new Set<number>() }),

  toggleWishlistItemSelection: (itemId: number) => {
    const nextSet = new Set<number>(get().selectedItemsIdsSet);
    nextSet.has(itemId) ? nextSet.delete(itemId) : nextSet.add(itemId);

    set({ selectedItemsIdsSet: nextSet });
  },
}));
