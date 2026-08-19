import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import { queryKeys } from "../constants/queryKeys";
import { orderService, type PlaceOrderPayload } from "../services/orderService";
import { getErrorMessage } from "../services/api";
import type { OrderStatus } from "../types";

export function useOrders(status?: OrderStatus | "active" | "past") {
  return useQuery({
    queryKey: queryKeys.orders.list(status),
    queryFn: () => orderService.list(status),
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id ?? ""),
    queryFn: () => orderService.detail(id as string),
    enabled: !!id,
  });
}

export function useOrderTracking(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.orders.detail(id ?? ""), "track"],
    queryFn: () => orderService.track(id as string),
    enabled: !!id && enabled,
    refetchInterval: 8000,
  });
}

export function usePlaceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PlaceOrderPayload) => orderService.place(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.detail });
    },
    onError: (error) => Toast.show({ type: "error", text1: "Order failed", text2: getErrorMessage(error) }),
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => orderService.cancel(id, reason),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(variables.id) });
    },
  });
}

export function useReorder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => orderService.reorder(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.detail });
      Toast.show({ type: "success", text1: "Items added to cart" });
    },
    onError: (error) => Toast.show({ type: "error", text1: "Reorder failed", text2: getErrorMessage(error) }),
  });
}
