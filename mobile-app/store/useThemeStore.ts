import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { ASYNC_STORAGE_KEYS } from "../constants/config";

export type ThemePreference = "light" | "dark" | "system";

interface ThemeState {
  preference: ThemePreference;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setPreference: (preference: ThemePreference) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  preference: "system",
  hydrated: false,
  hydrate: async () => {
    const stored = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.themePreference);
    set({ preference: (stored as ThemePreference) ?? "system", hydrated: true });
  },
  setPreference: (preference) => {
    set({ preference });
    void AsyncStorage.setItem(ASYNC_STORAGE_KEYS.themePreference, preference);
  },
}));
