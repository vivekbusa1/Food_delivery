import { api } from "./api";
import type { AppNotification } from "../types";

type BackendListEnvelope = {
  success?: boolean;
  message?: string;
  data?: unknown;
  meta?: unknown;
};

type RawNotification = Record<string, unknown> & {
  _id?: string;
  id?: string;
  title?: string;
  message?: string;
  type?: string;
  isRead?: boolean;
  createdAt?: string;
  data?: Record<string, unknown>;
};

function mapNotificationType(type: string | undefined): AppNotification["type"] {
  if (type === "order") return "order";
  if (type === "promotion" || type === "offer") return "offer";
  return "system";
}

export function mapNotification(raw: unknown): AppNotification {
  const notification = (raw ?? {}) as RawNotification;
  return {
    id: String(notification.id ?? notification._id ?? ""),
    title: String(notification.title ?? ""),
    message: String(notification.message ?? ""),
    type: mapNotificationType(notification.type),
    isRead: Boolean(notification.isRead),
    createdAt: String(notification.createdAt ?? new Date().toISOString()),
    data: notification.data,
  };
}

/** Backend responds with `{ data: Notification[], meta }`. */
function unwrapList(body: unknown): AppNotification[] {
  if (Array.isArray(body)) return body.map(mapNotification);

  const envelope = body as BackendListEnvelope;
  if (Array.isArray(envelope?.data)) return envelope.data.map(mapNotification);

  const nested = envelope?.data as { notifications?: unknown[]; items?: unknown[] } | undefined;
  if (Array.isArray(nested?.notifications)) return nested.notifications.map(mapNotification);
  if (Array.isArray(nested?.items)) return nested.items.map(mapNotification);

  return [];
}

export const notificationService = {
  list: () => api.get<BackendListEnvelope>("/notifications").then((res) => unwrapList(res.data)),

  markAsRead: (id: string) =>
    api.patch<{ success: boolean }>(`/notifications/${id}/read`).then((res) => res.data),

  markAllAsRead: () =>
    api.patch<{ success: boolean }>("/notifications/read-all").then((res) => res.data),

  remove: (id: string) => api.delete<{ success: boolean }>(`/notifications/${id}`).then((res) => res.data),
};
