import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../constants/queryKeys";
import { notificationService } from "../services/notificationService";

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: notificationService.list,
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.remove(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });
}
