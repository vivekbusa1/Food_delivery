// ---------------------------------------------------------------------------
// Shared / generic types
// ---------------------------------------------------------------------------

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

export type Status = 'active' | 'inactive' | 'blocked' | 'pending' | 'approved' | 'rejected';

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
  permissions?: string[];
  createdAt?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AdminUser;
  accessToken: string;
  refreshToken: string;
}

// ---------------------------------------------------------------------------
// Users / Customers
// ---------------------------------------------------------------------------

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: 'active' | 'blocked';
  totalOrders?: number;
  totalSpent?: number;
  walletBalance?: number;
  createdAt: string;
  addresses?: Address[];
}

export interface Address {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  lat?: number;
  lng?: number;
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Restaurants
// ---------------------------------------------------------------------------

export interface Restaurant {
  id: string;
  name: string;
  email: string;
  phone: string;
  logo?: string;
  coverImage?: string;
  address: string;
  city: string;
  cuisines: string[];
  rating?: number;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  isOpen: boolean;
  commissionRate?: number;
  ownerName?: string;
  totalOrders?: number;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: { id: string; name: string; phone: string };
  restaurant: { id: string; name: string };
  deliveryPartner?: { id: string; name: string; phone: string };
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  deliveryAddress: string;
  createdAt: string;
  updatedAt?: string;
}

// ---------------------------------------------------------------------------
// Delivery Partners / Delivery Management
// ---------------------------------------------------------------------------

export interface DeliveryPartner {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  vehicleType: string;
  vehicleNumber?: string;
  status: 'active' | 'inactive' | 'blocked';
  isOnline: boolean;
  rating?: number;
  totalDeliveries?: number;
  earnings?: number;
  documentsVerified: boolean;
  createdAt: string;
}

export interface DeliveryAssignment {
  id: string;
  orderNumber: string;
  partner?: { id: string; name: string };
  status: 'unassigned' | 'assigned' | 'picked_up' | 'delivered' | 'failed';
  pickupAddress: string;
  dropAddress: string;
  distance?: number;
  eta?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Categories / Cuisine
// ---------------------------------------------------------------------------

export interface FoodCategory {
  id: string;
  name: string;
  image?: string;
  description?: string;
  isActive: boolean;
  sortOrder?: number;
  itemCount?: number;
  createdAt: string;
}

export interface Cuisine {
  id: string;
  name: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Banners / Coupons / Offers
// ---------------------------------------------------------------------------

export interface Banner {
  id: string;
  title: string;
  image: string;
  linkType: 'restaurant' | 'category' | 'offer' | 'external' | 'none';
  linkValue?: string;
  position: 'home_top' | 'home_middle' | 'category' | 'checkout';
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  sortOrder?: number;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  maxDiscount?: number;
  minOrderValue?: number;
  usageLimit?: number;
  usagePerUser?: number;
  usedCount?: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface Offer {
  id: string;
  title: string;
  description?: string;
  image?: string;
  offerType: 'restaurant' | 'category' | 'item' | 'platform';
  discountValue: number;
  targetId?: string;
  targetName?: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

export interface Payment {
  id: string;
  orderNumber: string;
  customer: { id: string; name: string };
  amount: number;
  method: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  gatewayRef?: string;
  createdAt: string;
}

export interface RefundRequest {
  id: string;
  orderNumber: string;
  customer: { id: string; name: string };
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export interface NotificationLog {
  id: string;
  title: string;
  message: string;
  channel: 'push' | 'email' | 'sms';
  audience: 'all' | 'customers' | 'restaurants' | 'delivery_partners' | 'segment';
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  sentAt?: string;
  scheduledAt?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// CMS
// ---------------------------------------------------------------------------

export interface CmsPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  isPublished: boolean;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Settings / Roles / Logs
// ---------------------------------------------------------------------------

export interface AppSettings {
  siteName: string;
  supportEmail: string;
  supportPhone: string;
  currency: string;
  deliveryRadiusKm: number;
  defaultCommissionRate: number;
  minOrderValue: number;
  taxPercent: number;
  maintenanceMode: boolean;
  [key: string]: unknown;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  usersCount?: number;
  createdAt: string;
}

export interface Permission {
  key: string;
  label: string;
  group: string;
}

export interface LogEntry {
  id: string;
  actor: string;
  action: string;
  entity: string;
  entityId?: string;
  ip?: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Analytics / Reports
// ---------------------------------------------------------------------------

export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  totalUsers: number;
  usersChange: number;
  totalRestaurants: number;
  restaurantsChange: number;
  activeDeliveryPartners: number;
  pendingOrders: number;
}

export interface TimeSeriesPoint {
  label: string;
  value: number;
  [key: string]: unknown;
}

export interface TopEntity {
  id: string;
  name: string;
  image?: string;
  value: number;
  metric: string;
}
