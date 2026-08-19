import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { ASYNC_STORAGE_KEYS } from "../constants/config";

interface OnboardingState {
  hasOnboarded: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  completeOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  hasOnboarded: false,
  hydrated: false,
  hydrate: async () => {
    const stored = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.hasOnboarded);
    set({ hasOnboarded: stored === "true", hydrated: true });
  },
  completeOnboarding: () => {
    set({ hasOnboarded: true });
    void AsyncStorage.setItem(ASYNC_STORAGE_KEYS.hasOnboarded, "true");
  },
}));
