import { create } from "zustand";

export type SortOption = "rating" | "deliveryTime" | "distance";

interface FilterState {
  minRating: number;
  maxPrice: number | null;
  sortBy: SortOption | null;
  vegOnly: boolean;
  setMinRating: (value: number) => void;
  setMaxPrice: (value: number | null) => void;
  setSortBy: (value: SortOption | null) => void;
  setVegOnly: (value: boolean) => void;
  reset: () => void;
}

const initialState = {
  minRating: 0,
  maxPrice: null as number | null,
  sortBy: null as SortOption | null,
  vegOnly: false,
};

export const useFilterStore = create<FilterState>((set) => ({
  ...initialState,
  setMinRating: (minRating) => set({ minRating }),
  setMaxPrice: (maxPrice) => set({ maxPrice }),
  setSortBy: (sortBy) => set({ sortBy }),
  setVegOnly: (vegOnly) => set({ vegOnly }),
  reset: () => set({ ...initialState }),
}));
