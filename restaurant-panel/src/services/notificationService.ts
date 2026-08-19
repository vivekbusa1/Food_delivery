import { apiClient } from './apiClient';
import { normalizeId } from '@/utils/restaurantSession';
import type {
  AppNotification,
  NotificationPreferences,
  PaginatedResponse,
} from '@/types';

function mapNotification(raw: Record<string, unknown>): AppNotification {
  const n = normalizeId(raw) as Record<string, unknown>;
  const type = String(n.type ?? 'system');
  return {
    id: String(n.id ?? ''),
    title: String(n.title ?? ''),
    message: String(n.message ?? n.body ?? ''),
    type: (['order', 'review', 'system', 'offer', 'payment'].includes(type)
      ? type
      : 'system') as AppNotification['type'],
    isRead: Boolean(n.isRead),
    createdAt: String(n.createdAt ?? ''),
    link: n.link ? String(n.link) : undefined,
  };
}

const DEFAULT_PREFS: NotificationPreferences = {
  newOrderEmail: true,
  newOrderSms: false,
  newOrderPush: true,
  reviewAlerts: true,
  payoutAlerts: true,
  marketingUpdates: false,
};

export const notificationService = {
  async list(page = 1, limit = 20): Promise<PaginatedResponse<AppNotification>> {
    const { data } = await apiClient.get('/notifications', { params: { page, limit } });
    const items = Array.isArray(data.data) ? data.data : [];
    return {
      success: data.success !== false,
      message: data.message,
      data: items.map((item: Record<string, unknown>) => mapNotification(item)),
      meta: {
        page: data.meta?.page ?? page,
        limit: data.meta?.limit ?? limit,
        total: data.meta?.total ?? items.length,
        totalPages: data.meta?.totalPages ?? 1,
      },
    };
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/notifications/read-all');
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },

  async getPreferences(): Promise<NotificationPreferences> {
    return { ...DEFAULT_PREFS };
  },

  async updatePreferences(
    payload: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    return { ...DEFAULT_PREFS, ...payload };
  },
};
