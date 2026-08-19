export type NotificationType = 'order' | 'review' | 'system' | 'offer' | 'payment';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface NotificationPreferences {
  newOrderEmail: boolean;
  newOrderSms: boolean;
  newOrderPush: boolean;
  reviewAlerts: boolean;
  payoutAlerts: boolean;
  marketingUpdates: boolean;
}
