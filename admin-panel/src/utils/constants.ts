export const API_URL = import.meta.env.VITE_API_URL || '/api/v1';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Delivery Admin Panel';

export const ACCESS_TOKEN_KEY = 'admin_access_token';
export const REFRESH_TOKEN_KEY = 'admin_refresh_token';
export const ADMIN_USER_KEY = 'admin_user';

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export const ORDER_STATUS_OPTIONS = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'refunded',
] as const;

export const ORDER_STATUS_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  pending: 'warning',
  confirmed: 'info',
  preparing: 'info',
  ready: 'primary',
  out_for_delivery: 'primary',
  delivered: 'success',
  cancelled: 'error',
  refunded: 'default',
};

export const PAYMENT_STATUS_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  pending: 'warning',
  success: 'success',
  paid: 'success',
  failed: 'error',
  refunded: 'default',
};

export const RESTAURANT_STATUS_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  suspended: 'default',
};

export const VEHICLE_TYPES = ['bike', 'scooter', 'bicycle', 'car'] as const;

export const NOTIFICATION_AUDIENCES = ['all', 'customers', 'restaurants', 'delivery_partners', 'segment'] as const;

export const PERMISSION_GROUPS = [
  'Dashboard',
  'Orders',
  'Customers',
  'Restaurants',
  'Delivery',
  'Catalog',
  'Marketing',
  'Payments',
  'Reports',
  'CMS',
  'Notifications',
  'Settings',
  'Roles',
  'Logs',
];

export const ALL_PERMISSIONS = [
  { key: 'dashboard.view', label: 'View Dashboard', group: 'Dashboard' },
  { key: 'orders.view', label: 'View Orders', group: 'Orders' },
  { key: 'orders.manage', label: 'Manage Orders', group: 'Orders' },
  { key: 'customers.view', label: 'View Customers', group: 'Customers' },
  { key: 'customers.manage', label: 'Manage Customers', group: 'Customers' },
  { key: 'restaurants.view', label: 'View Restaurants', group: 'Restaurants' },
  { key: 'restaurants.manage', label: 'Manage Restaurants', group: 'Restaurants' },
  { key: 'delivery.view', label: 'View Delivery', group: 'Delivery' },
  { key: 'delivery.manage', label: 'Manage Delivery', group: 'Delivery' },
  { key: 'catalog.manage', label: 'Manage Catalog', group: 'Catalog' },
  { key: 'marketing.manage', label: 'Manage Marketing', group: 'Marketing' },
  { key: 'payments.view', label: 'View Payments', group: 'Payments' },
  { key: 'payments.manage', label: 'Manage Payments', group: 'Payments' },
  { key: 'reports.view', label: 'View Reports', group: 'Reports' },
  { key: 'cms.manage', label: 'Manage CMS', group: 'CMS' },
  { key: 'notifications.manage', label: 'Manage Notifications', group: 'Notifications' },
  { key: 'settings.manage', label: 'Manage Settings', group: 'Settings' },
  { key: 'roles.manage', label: 'Manage Roles', group: 'Roles' },
  { key: 'logs.view', label: 'View Logs', group: 'Logs' },
];
