import { create } from "zustand";

import type { Order } from "../types";

// Lightweight client-side UI state for the checkout flow. The cart and order data
// itself always lives on the server and is fetched/mutated via React Query; this
// store only tracks transient selections as the user moves across checkout screens.
interface CheckoutState {
  selectedAddressId: string | null;
  paymentMethod: Order["paymentMethod"];
  notes: string;
  setSelectedAddressId: (id: string | null) => void;
  setPaymentMethod: (method: Order["paymentMethod"]) => void;
  setNotes: (notes: string) => void;
  reset: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  selectedAddressId: null,
  paymentMethod: "cash",
  notes: "",
  setSelectedAddressId: (id) => set({ selectedAddressId: id }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setNotes: (notes) => set({ notes }),
  reset: () => set({ selectedAddressId: null, paymentMethod: "cash", notes: "" }),
}));
