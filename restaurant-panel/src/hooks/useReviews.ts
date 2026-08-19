import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { reviewService } from '@/services/reviewService';
import { extractErrorMessage } from '@/services/apiClient';
import type { ReplyReviewPayload, ReviewListParams } from '@/types';

export const reviewKeys = {
  all: ['reviews'] as const,
  list: (params: ReviewListParams) => ['reviews', 'list', params] as const,
  summary: ['reviews', 'summary'] as const,
};

export function useReviews(params: ReviewListParams) {
  return useQuery({
    queryKey: reviewKeys.list(params),
    queryFn: () => reviewService.list(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useReviewSummary() {
  return useQuery({
    queryKey: reviewKeys.summary,
    queryFn: reviewService.getSummary,
    staleTime: 60_000,
  });
}

export function useReplyToReview() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReplyReviewPayload }) =>
      reviewService.reply(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
      enqueueSnackbar('Reply posted', { variant: 'success' });
    },
    onError: (error) => enqueueSnackbar(extractErrorMessage(error), { variant: 'error' }),
  });
}
