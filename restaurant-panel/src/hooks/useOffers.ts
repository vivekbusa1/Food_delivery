import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { offerService } from '@/services/offerService';
import { extractErrorMessage } from '@/services/apiClient';
import type { OfferPayload } from '@/types';

export const offerKeys = {
  all: ['offers'] as const,
};

export function useOffers() {
  return useQuery({
    queryKey: offerKeys.all,
    queryFn: offerService.list,
    staleTime: 30_000,
  });
}

export function useCreateOffer() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: OfferPayload) => offerService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: offerKeys.all });
      enqueueSnackbar('Offer created', { variant: 'success' });
    },
    onError: (error) => enqueueSnackbar(extractErrorMessage(error), { variant: 'error' }),
  });
}

export function useUpdateOffer() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<OfferPayload> }) =>
      offerService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: offerKeys.all });
      enqueueSnackbar('Offer updated', { variant: 'success' });
    },
    onError: (error) => enqueueSnackbar(extractErrorMessage(error), { variant: 'error' }),
  });
}

export function useDeleteOffer() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (id: string) => offerService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: offerKeys.all });
      enqueueSnackbar('Offer deleted', { variant: 'success' });
    },
    onError: (error) => enqueueSnackbar(extractErrorMessage(error), { variant: 'error' }),
  });
}

export function useToggleOffer() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      offerService.toggleActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: offerKeys.all });
    },
    onError: (error) => enqueueSnackbar(extractErrorMessage(error), { variant: 'error' }),
  });
}
