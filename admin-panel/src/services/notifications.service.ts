import api, { unwrap, unwrapPaginated } from './api';
import type { NotificationLog, Paginated, QueryParams } from '@/types';

export interface SendNotificationPayload {
  title: string;
  message: string;
  channel: NotificationLog['channel'];
  audience: NotificationLog['audience'];
  scheduledAt?: string;
}

const AUDIENCE_TO_ROLE: Record<string, string> = {
  all: 'all',
  customers: 'customer',
  customer: 'customer',
  restaurants: 'restaurant',
  restaurant: 'restaurant',
  delivery_partners: 'delivery',
  partners: 'delivery',
  delivery: 'delivery',
  segment: 'all',
  admins: 'admin',
  admin: 'admin',
};

const ROLE_TO_AUDIENCE: Record<string, NotificationLog['audience']> = {
  all: 'all',
  customer: 'customers',
  restaurant: 'restaurants',
  delivery: 'delivery_partners',
  admin: 'all',
};

const mapNotification = (n: Record<string, unknown>): NotificationLog => ({
  id: String(n.id ?? n._id ?? ''),
  title: String(n.title ?? ''),
  message: String(n.message ?? n.body ?? ''),
  channel: String(n.channel ?? 'push') as NotificationLog['channel'],
  audience: ROLE_TO_AUDIENCE[String(n.role ?? n.audience ?? 'all')] ?? 'all',
  status: String(n.status ?? 'sent') as NotificationLog['status'],
  sentAt: n.sentAt ? String(n.sentAt) : n.createdAt ? String(n.createdAt) : undefined,
  scheduledAt: n.scheduledAt ? String(n.scheduledAt) : undefined,
  createdAt: String(n.createdAt ?? ''),
});

export const notificationsService = {
  list: async (params: QueryParams = {}): Promise<Paginated<NotificationLog>> => {
    const res = await api.get('/notifications', { params });
    const page = unwrapPaginated<Record<string, unknown>>(res);
    return { ...page, items: page.items.map(mapNotification) };
  },
  send: async (payload: SendNotificationPayload): Promise<NotificationLog> => {
    const res = await api.post('/notifications/broadcast', {
      title: payload.title,
      message: payload.message,
      body: payload.message,
      // Backend Notification.type enum: order|promotion|account|payment|system|delivery
      type: 'promotion',
      role: AUDIENCE_TO_ROLE[payload.audience] ?? 'all',
    });
    const data = unwrap<{ notification?: Record<string, unknown> }>(res);
    return mapNotification(data.notification ?? { title: payload.title, message: payload.message });
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },
};
