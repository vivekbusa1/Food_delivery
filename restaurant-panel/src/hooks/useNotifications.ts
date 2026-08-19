import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { notificationService } from '@/services/notificationService';
import { extractErrorMessage } from '@/services/apiClient';
import { NOTIFICATIONS_REFETCH_INTERVAL_MS } from '@/utils/constants';
import type { NotificationPreferences } from '@/types';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (page: number) => ['notifications', 'list', page] as const,
  preferences: ['notifications', 'preferences'] as const,
};

export function useNotifications(page = 1) {
  return useQuery({
    queryKey: notificationKeys.list(page),
    queryFn: () => notificationService.list(page),
    refetchInterval: NOTIFICATIONS_REFETCH_INTERVAL_MS,
    placeholderData: (previousData) => previousData,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      enqueueSnackbar('All notifications marked as read', { variant: 'success' });
    },
    onError: (error) => enqueueSnackbar(extractErrorMessage(error), { variant: 'error' }),
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationKeys.preferences,
    queryFn: notificationService.getPreferences,
    staleTime: 60_000,
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  return useMutation({
    mutationFn: (payload: Partial<NotificationPreferences>) =>
      notificationService.updatePreferences(payload),
    onSuccess: (data) => {
      queryClient.setQueryData<NotificationPreferences>(notificationKeys.preferences, data);
      enqueueSnackbar('Preferences saved', { variant: 'success' });
    },
    onError: (error) => enqueueSnackbar(extractErrorMessage(error), { variant: 'error' }),
  });
}
