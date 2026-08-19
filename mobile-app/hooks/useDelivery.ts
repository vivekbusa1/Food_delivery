import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import { queryKeys } from "../constants/queryKeys";
import { deliveryService } from "../services/deliveryService";
import { getErrorMessage } from "../services/api";
import type { Order } from "../types";

export function useDeliveryDashboard() {
  return useQuery({
    queryKey: queryKeys.delivery.dashboard,
    queryFn: deliveryService.dashboard,
    refetchInterval: 15000,
  });
}

export function useSetOnlineStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isOnline: boolean) => deliveryService.setOnlineStatus(isOnline),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.delivery.dashboard }),
  });
}

export function useAvailableDeliveryOrders(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.delivery.availableOrders,
    queryFn: deliveryService.availableOrders,
    enabled,
    refetchInterval: enabled ? 6000 : false,
  });
}

export function useAcceptDeliveryOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => deliveryService.acceptOrder(orderId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.delivery.availableOrders });
      void queryClient.invalidateQueries({ queryKey: queryKeys.delivery.active });
      void queryClient.invalidateQueries({ queryKey: queryKeys.delivery.dashboard });
      Toast.show({ type: "success", text1: "Order accepted" });
    },
    onError: (error) => Toast.show({ type: "error", text1: "Could not accept order", text2: getErrorMessage(error) }),
  });
}

export function useRejectDeliveryOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => deliveryService.rejectOrder(orderId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.delivery.availableOrders }),
  });
}

export function useActiveDeliveryOrder() {
  return useQuery({
    queryKey: queryKeys.delivery.active,
    queryFn: deliveryService.activeOrder,
    refetchInterval: 10000,
  });
}

export function useUpdateDeliveryOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: Order["status"] }) =>
      deliveryService.updateOrderStatus(orderId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.delivery.active });
      void queryClient.invalidateQueries({ queryKey: queryKeys.delivery.history });
      void queryClient.invalidateQueries({ queryKey: queryKeys.delivery.dashboard });
    },
  });
}

export function useDeliveryHistory() {
  return useQuery({ queryKey: queryKeys.delivery.history, queryFn: deliveryService.history });
}

export function useDeliveryWallet() {
  return useQuery({ queryKey: queryKeys.delivery.wallet, queryFn: deliveryService.wallet });
}

export function useDeliveryProfile() {
  return useQuery({ queryKey: queryKeys.delivery.profile, queryFn: deliveryService.profile });
}

export function useUpdateDeliveryLocation() {
  return useMutation({
    mutationFn: ({ latitude, longitude }: { latitude: number; longitude: number }) =>
      deliveryService.updateLocation(latitude, longitude),
  });
}
