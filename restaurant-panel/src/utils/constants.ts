export const API_BASE_URL: string = import.meta.env.VITE_API_URL || '/api/v1';

export const ASSET_BASE_URL: string =
  import.meta.env.VITE_ASSET_URL || 'http://127.0.0.1:5001';

export const APP_NAME: string = import.meta.env.VITE_APP_NAME || 'Restaurant Panel';

export const ACCESS_TOKEN_KEY = 'rp_access_token';
export const REFRESH_TOKEN_KEY = 'rp_refresh_token';
export const USER_KEY = 'rp_user';

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'New',
  accepted: 'Accepted',
  rejected: 'Rejected',
  preparing: 'Preparing',
  ready: 'Ready for Pickup',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_COLORS: Record<
  string,
  'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
> = {
  pending: 'warning',
  accepted: 'info',
  rejected: 'error',
  preparing: 'secondary',
  ready: 'primary',
  out_for_delivery: 'info',
  delivered: 'success',
  completed: 'success',
  cancelled: 'error',
};

export const WEEK_DAYS: { key: string; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

export const CUISINE_TYPES: string[] = [
  'North Indian',
  'South Indian',
  'Chinese',
  'Italian',
  'Mexican',
  'Fast Food',
  'Bakery',
  'Desserts',
  'Beverages',
  'Continental',
  'Thai',
  'Mughlai',
  'Street Food',
  'Healthy Food',
];

export const ORDERS_REFETCH_INTERVAL_MS = 15_000;
export const NOTIFICATIONS_REFETCH_INTERVAL_MS = 30_000;

export const DRAWER_WIDTH = 264;
