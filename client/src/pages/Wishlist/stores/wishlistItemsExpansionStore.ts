import { create } from 'zustand';

type WishlistItemsExpansionStoreType = {
  expandedItemsIdsSet: Set<number>;

  expandAllWishlistItems: (itemIdsArr: number[]) => void;
  collapseAllWishlistItems: () => void;
  toggleWishlistItemsExpansion: (itemId: number) => void;
};

const useWishlistItemsExpansionStore = create<WishlistItemsExpansionStoreType>((set, get) => ({
  expandedItemsIdsSet: new Set<number>(),

  expandAllWishlistItems: (itemIdsArr: number[]) => set({ expandedItemsIdsSet: new Set<number>(itemIdsArr) }),
  collapseAllWishlistItems: () => set({ expandedItemsIdsSet: new Set<number>() }),

  toggleWishlistItemsExpansion: (itemId: number) => {
    const nextSet = new Set<number>(get().expandedItemsIdsSet);
    nextSet.has(itemId) ? nextSet.delete(itemId) : nextSet.add(itemId);

    set({ expandedItemsIdsSet: nextSet });
  },
}));

export default useWishlistItemsExpansionStore;
