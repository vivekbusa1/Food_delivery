// Domain types shared across services, hooks, and screens.
// These mirror the expected shape of the backend REST API responses.

export type UserRole = "customer" | "delivery_partner";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string | null;
  role: UserRole;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface Category {
  id: string;
  name: string;
  imageUrl: string;
  itemCount?: number;
}

export interface Address {
  id: string;
  label: string; // Home, Work, Other
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
  instructions?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  coverImageUrl?: string;
  cuisines: string[];
  rating: number;
  ratingCount: number;
  priceRange: 1 | 2 | 3 | 4;
  deliveryTimeMinutes: number;
  deliveryFee: number;
  minOrderAmount: number;
  distanceKm?: number;
  isOpen: boolean;
  isFavorite?: boolean;
  address: string;
  latitude: number;
  longitude: number;
  promoted?: boolean;
  discountLabel?: string | null;
}

export interface FoodOption {
  id: string;
  name: string;
  priceDelta: number;
}

export interface FoodOptionGroup {
  id: string;
  name: string;
  required: boolean;
  multiSelect: boolean;
  options: FoodOption[];
}

export interface Food {
  id: string;
  restaurantId: string;
  restaurantName?: string;
  name: string;
  description?: string;
  imageUrl: string;
  price: number;
  discountedPrice?: number | null;
  rating: number;
  ratingCount: number;
  isVeg: boolean;
  isPopular?: boolean;
  isRecommended?: boolean;
  categoryId?: string;
  optionGroups?: FoodOptionGroup[];
  isWishlisted?: boolean;
}

export interface CartItemOptionSelection {
  groupId: string;
  optionIds: string[];
}

export interface CartItem {
  id: string;
  food: Food;
  quantity: number;
  selectedOptions: CartItemOptionSelection[];
  notes?: string;
  itemTotal: number;
}

export interface Cart {
  id: string;
  restaurantId: string | null;
  restaurantName?: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  discount: number;
  total: number;
  appliedCoupon?: Coupon | null;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  expiresAt?: string;
}

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "preparing"
  | "ready_for_pickup"
  | "picked_up"
  | "on_the_way"
  | "delivered"
  | "cancelled";

export interface OrderTimelineEntry {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface DeliveryPartnerSummary {
  id: string;
  name: string;
  phone: string;
  avatarUrl?: string | null;
  rating: number;
  vehicleNumber?: string;
  latitude?: number;
  longitude?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  restaurant: Pick<Restaurant, "id" | "name" | "imageUrl" | "latitude" | "longitude">;
  items: CartItem[];
  address: Address;
  status: OrderStatus;
  timeline: OrderTimelineEntry[];
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  discount: number;
  total: number;
  paymentMethod: "card" | "cash" | "wallet" | "upi";
  placedAt: string;
  estimatedDeliveryAt?: string;
  deliveredAt?: string;
  deliveryPartner?: DeliveryPartnerSummary | null;
  rating?: number | null;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string | null;
  restaurantId?: string;
  foodId?: string;
  orderId?: string;
  rating: number;
  comment: string;
  createdAt: string;
  images?: string[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "order" | "offer" | "system";
  isRead: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  code?: string;
  validUntil?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

export interface DeliveryWalletTransaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  createdAt: string;
}

export interface DeliveryWallet {
  balance: number;
  totalEarnings: number;
  transactions: DeliveryWalletTransaction[];
}

export interface DeliveryOrderRequest {
  order: Order;
  distanceKm: number;
  estimatedEarnings: number;
  expiresInSeconds: number;
}
