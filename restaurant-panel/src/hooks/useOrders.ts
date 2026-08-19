import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { orderService } from '@/services/orderService';
import { extractErrorMessage } from '@/services/apiClient';
import { ORDERS_REFETCH_INTERVAL_MS } from '@/utils/constants';
import type { AssignDeliveryPayload, OrderListParams, UpdateOrderStatusPayload } from '@/types';

export const orderKeys = {
  all: ['orders'] as const,
  list: (params: OrderListParams) => ['orders', 'list', params] as const,
  detail: (id: string) => ['orders', 'detail', id] as const,
  deliveryPartners: ['orders', 'delivery-partners'] as const,
};

export function useOrders(params: OrderListParams, options?: { realtime?: boolean }) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => orderService.list(params),
    placeholderData: (previousData) => previousData,
    refetchInterval: options?.realtime === false ? false : ORDERS_REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: true,
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: orderKeys.detail(id ?? ''),
    queryFn: () => orderService.getById(id as string),
    enabled: Boolean(id),
    refetchInterval: ORDERS_REFETCH_INTERVAL_MS,
  });
}

export function useAvailableDeliveryPartners() {
  return useQuery({
    queryKey: orderKeys.deliveryPartners,
    queryFn: orderService.getAvailableDeliveryPartners,
    staleTime: 60_000,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateOrderStatusPayload }) =>
      orderService.updateStatus(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
      enqueueSnackbar('Order status updated', { variant: 'success' });
    },
    onError: (error) => enqueueSnackbar(extractErrorMessage(error), { variant: 'error' }),
  });
}

export function useAssignDelivery() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AssignDeliveryPayload }) =>
      orderService.assignDelivery(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
      enqueueSnackbar('Delivery partner assigned', { variant: 'success' });
    },
    onError: (error) => enqueueSnackbar(extractErrorMessage(error), { variant: 'error' }),
  });
}
