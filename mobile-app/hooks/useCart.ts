import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import { queryKeys } from "../constants/queryKeys";
import { cartService, type AddToCartPayload } from "../services/cartService";
import { getErrorMessage } from "../services/api";
import type { Cart } from "../types";

export function useCart() {
  return useQuery({ queryKey: queryKeys.cart.detail, queryFn: cartService.get });
}

function useCartMutation<TVariables>(
  mutationFn: (vars: TVariables) => Promise<Cart>,
  successMessage?: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.cart.detail, data);
      if (successMessage) Toast.show({ type: "success", text1: successMessage });
    },
    onError: (error) => {
      Toast.show({ type: "error", text1: "Cart error", text2: getErrorMessage(error) });
    },
  });
}

export function useAddToCart() {
  return useCartMutation((payload: AddToCartPayload) => cartService.addItem(payload), "Added to cart");
}

export function useUpdateCartItem() {
  return useCartMutation(({ itemId, quantity }: { itemId: string; quantity: number }) =>
    cartService.updateItem(itemId, quantity),
  );
}

export function useRemoveCartItem() {
  return useCartMutation((itemId: string) => cartService.removeItem(itemId), "Item removed");
}

export function useClearCart() {
  return useCartMutation<void>(() => cartService.clear());
}

export function useApplyCoupon() {
  return useCartMutation((code: string) => cartService.applyCoupon(code), "Coupon applied");
}

export function useRemoveCoupon() {
  return useCartMutation<void>(() => cartService.removeCoupon());
}
