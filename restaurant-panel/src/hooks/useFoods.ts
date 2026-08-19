import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { foodService } from '@/services/foodService';
import { extractErrorMessage } from '@/services/apiClient';
import type { FoodListParams, FoodPayload } from '@/types';

export const foodKeys = {
  all: ['foods'] as const,
  list: (params: FoodListParams) => ['foods', 'list', params] as const,
  detail: (id: string) => ['foods', 'detail', id] as const,
};

export function useFoods(params: FoodListParams) {
  return useQuery({
    queryKey: foodKeys.list(params),
    queryFn: () => foodService.list(params),
    placeholderData: (previousData) => previousData,
    staleTime: 15_000,
  });
}

export function useFood(id: string | undefined) {
  return useQuery({
    queryKey: foodKeys.detail(id ?? ''),
    queryFn: () => foodService.getById(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateFood() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: FoodPayload) => foodService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodKeys.all });
      enqueueSnackbar('Food item added', { variant: 'success' });
    },
    onError: (error) => enqueueSnackbar(extractErrorMessage(error), { variant: 'error' }),
  });
}

export function useUpdateFood() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<FoodPayload> }) =>
      foodService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodKeys.all });
      enqueueSnackbar('Food item updated', { variant: 'success' });
    },
    onError: (error) => enqueueSnackbar(extractErrorMessage(error), { variant: 'error' }),
  });
}

export function useDeleteFood() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (id: string) => foodService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodKeys.all });
      enqueueSnackbar('Food item deleted', { variant: 'success' });
    },
    onError: (error) => enqueueSnackbar(extractErrorMessage(error), { variant: 'error' }),
  });
}

export function useSetFoodAvailability() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      foodService.setAvailability(id, isAvailable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodKeys.all });
    },
    onError: (error) => enqueueSnackbar(extractErrorMessage(error), { variant: 'error' }),
  });
}

export function useUploadFoodImages() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ id, files }: { id: string; files: File[] }) =>
      foodService.uploadImages(id, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodKeys.all });
      enqueueSnackbar('Images uploaded', { variant: 'success' });
    },
    onError: (error) => enqueueSnackbar(extractErrorMessage(error), { variant: 'error' }),
  });
}

export function useRemoveFoodImage() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ id, imageUrl }: { id: string; imageUrl: string }) =>
      foodService.removeImage(id, imageUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodKeys.all });
    },
    onError: (error) => enqueueSnackbar(extractErrorMessage(error), { variant: 'error' }),
  });
}
