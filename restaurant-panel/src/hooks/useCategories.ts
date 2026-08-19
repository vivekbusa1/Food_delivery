import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { categoryService } from '@/services/categoryService';
import { extractErrorMessage } from '@/services/apiClient';
import type { CreateCategoryPayload, UpdateCategoryPayload } from '@/types';

export const categoryKeys = {
  all: ['categories'] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: categoryService.list,
    staleTime: 30_000,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => categoryService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      enqueueSnackbar('Category created', { variant: 'success' });
    },
    onError: (error) => enqueueSnackbar(extractErrorMessage(error), { variant: 'error' }),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) =>
      categoryService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      enqueueSnackbar('Category updated', { variant: 'success' });
    },
    onError: (error) => enqueueSnackbar(extractErrorMessage(error), { variant: 'error' }),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (id: string) => categoryService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      enqueueSnackbar('Category deleted', { variant: 'success' });
    },
    onError: (error) => enqueueSnackbar(extractErrorMessage(error), { variant: 'error' }),
  });
}
