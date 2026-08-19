import { api } from "./api";
import { mapAddress } from "./addressService";
import { mapCart, mapCartItem } from "./cartService";
import { mapRestaurant } from "./restaurantService";
import { asArray, pickId, unwrapData } from "../utils/apiHelpers";
import type { CartItem, Order, OrderStatus, OrderTimelineEntry, DeliveryPartnerSummary } from "../types";

export interface PlaceOrderPayload {
  addressId: string;
  paymentMethod: Order["paymentMethod"];
  couponCode?: string | null;
  notes?: string;
}

const STATUS_FROM_BACKEND: Record<string, OrderStatus> = {
  pending: "placed",
  placed: "placed",
  confirmed: "confirmed",
  preparing: "preparing",
  ready_for_pickup: "ready_for_pickup",
  picked_up: "picked_up",
  out_for_delivery: "on_the_way",
  on_the_way: "on_the_way",
  delivered: "delivered",
  cancelled: "cancelled",
  rejected: "cancelled",
};

const PAYMENT_TO_BACKEND: Record<Order["paymentMethod"], string> = {
  cash: "cod",
  card: "razorpay",
  upi: "razorpay",
  wallet: "wallet",
};

const PAYMENT_FROM_BACKEND: Record<string, Order["paymentMethod"]> = {
  cod: "cash",
  cash: "cash",
  razorpay: "card",
  stripe: "card",
  card: "card",
  upi: "upi",
  wallet: "wallet",
};

function mapOrderStatus(status: unknown): OrderStatus {
  const key = String(status ?? "pending");
  return STATUS_FROM_BACKEND[key] ?? "placed";
}

function mapPaymentMethod(method: unknown): Order["paymentMethod"] {
  const key = String(method ?? "cod");
  return PAYMENT_FROM_BACKEND[key] ?? "cash";
}

function mapTimeline(raw: unknown): OrderTimelineEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((entry) => {
    const item = (entry ?? {}) as Record<string, unknown>;
    return {
      status: mapOrderStatus(item.status),
      timestamp: String(item.changedAt ?? item.timestamp ?? new Date().toISOString()),
      note: item.note ? String(item.note) : undefined,
    };
  });
}

function mapDeliveryPartner(raw: unknown): DeliveryPartnerSummary | null {
  if (!raw || typeof raw !== "object") return null;
  const partner = raw as Record<string, unknown> & {
    user?: { name?: string; phone?: string; avatar?: { url?: string } | string };
    currentLocation?: { coordinates?: [number, number] };
    vehicleNumber?: string;
    ratingsAverage?: number;
  };
  const user = partner.user;
  const coords = partner.currentLocation?.coordinates;
  const avatar =
    typeof user?.avatar === "string"
      ? user.avatar
      : user?.avatar && typeof user.avatar === "object"
        ? user.avatar.url
        : undefined;

  return {
    id: pickId(partner),
    name: String(user?.name ?? partner.name ?? "Delivery partner"),
    phone: String(user?.phone ?? partner.phone ?? ""),
    avatarUrl: avatar ?? null,
    rating: Number(partner.ratingsAverage ?? partner.rating ?? 0),
    vehicleNumber: partner.vehicleNumber ? String(partner.vehicleNumber) : undefined,
    longitude: Array.isArray(coords) ? Number(coords[0] ?? 0) : undefined,
    latitude: Array.isArray(coords) ? Number(coords[1] ?? 0) : undefined,
  };
}

function mapOrderItem(raw: unknown): CartItem {
  const item = (raw ?? {}) as Record<string, unknown> & {
    food?: unknown;
    name?: string;
    image?: string;
    quantity?: number;
    totalPrice?: number;
    specialInstructions?: string;
    variant?: { name?: string };
    addons?: Array<{ name?: string }>;
  };

  // Order items store denormalized name/image; fall back to cart-item mapper when food is populated.
  if (item.food && typeof item.food === "object") {
    return mapCartItem({
      ...item,
      selectedOptions: undefined,
      notes: item.specialInstructions,
      itemTotal: item.totalPrice,
    });
  }

  const optionIds = [
    item.variant?.name,
    ...(Array.isArray(item.addons) ? item.addons.map((addon) => addon.name) : []),
  ].filter(Boolean) as string[];

  return {
    id: pickId(item),
    food: {
      id: refId(item.food) ?? pickId(item),
      restaurantId: "",
      name: String(item.name ?? ""),
      imageUrl: String(item.image ?? ""),
      price: Number(item.price ?? 0),
      rating: 0,
      ratingCount: 0,
      isVeg: false,
    },
    quantity: Number(item.quantity ?? 1),
    selectedOptions: optionIds.length ? [{ groupId: "options", optionIds }] : [],
    notes: item.specialInstructions ? String(item.specialInstructions) : undefined,
    itemTotal: Number(item.totalPrice ?? 0),
  };
}

function refId(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const obj = value as { _id?: string; id?: string };
    const id = obj.id ?? obj._id;
    return id != null ? String(id) : undefined;
  }
  return undefined;
}

export function mapOrder(raw: unknown): Order {
  const order = (raw ?? {}) as Record<string, unknown> & {
    restaurant?: unknown;
    items?: unknown[];
    deliveryAddress?: unknown;
    address?: unknown;
    statusHistory?: unknown[];
    timeline?: unknown[];
    deliveryPartner?: unknown;
    subTotal?: number;
    subtotal?: number;
    taxAmount?: number;
    taxes?: number;
    deliveryFee?: number;
    discount?: number;
    total?: number;
    paymentMethod?: string;
    orderNumber?: string;
    createdAt?: string;
    estimatedDeliveryTime?: string;
    estimatedDeliveryAt?: string;
    deliveredAt?: string;
    isReviewed?: boolean;
    rating?: number | null;
  };

  const restaurantRaw = order.restaurant;
  const restaurantMapped =
    restaurantRaw && typeof restaurantRaw === "object"
      ? mapRestaurant(restaurantRaw)
      : {
          id: refId(restaurantRaw) ?? "",
          name: "",
          imageUrl: "",
          latitude: 0,
          longitude: 0,
        };

  const addressRaw = order.address ?? order.deliveryAddress;
  const address =
    addressRaw && typeof addressRaw === "object"
      ? mapAddress({
          ...(addressRaw as object),
          id: pickId(addressRaw as Record<string, unknown>) || `order-address-${pickId(order)}`,
        })
      : mapAddress({});

  return {
    id: pickId(order),
    orderNumber: String(order.orderNumber ?? pickId(order)),
    restaurant: {
      id: restaurantMapped.id,
      name: restaurantMapped.name,
      imageUrl: restaurantMapped.imageUrl,
      latitude: restaurantMapped.latitude,
      longitude: restaurantMapped.longitude,
    },
    items: asArray(order.items).map(mapOrderItem),
    address,
    status: mapOrderStatus(order.status),
    timeline: mapTimeline(order.timeline ?? order.statusHistory),
    subtotal: Number(order.subtotal ?? order.subTotal ?? 0),
    deliveryFee: Number(order.deliveryFee ?? 0),
    taxes: Number(order.taxes ?? order.taxAmount ?? 0),
    discount: Number(order.discount ?? 0),
    total: Number(order.total ?? 0),
    paymentMethod: mapPaymentMethod(order.paymentMethod),
    placedAt: String(order.placedAt ?? order.createdAt ?? new Date().toISOString()),
    estimatedDeliveryAt: order.estimatedDeliveryAt
      ? String(order.estimatedDeliveryAt)
      : order.estimatedDeliveryTime
        ? String(order.estimatedDeliveryTime)
        : undefined,
    deliveredAt: order.deliveredAt ? String(order.deliveredAt) : undefined,
    deliveryPartner: mapDeliveryPartner(order.deliveryPartner),
    rating: order.rating ?? (order.isReviewed ? 0 : null),
  };
}

function unwrapOrder(body: unknown): Order {
  const data = unwrapData<{ order?: unknown } | unknown>(body);
  if (data && typeof data === "object" && "order" in (data as object)) {
    return mapOrder((data as { order: unknown }).order);
  }
  return mapOrder(data);
}

export const orderService = {
  // Backend route is GET /orders/my; response body is `{ data: Order[], meta }`.
  // `active` / `past` are app-only filters — the API only accepts concrete status values.
  list: async (status?: OrderStatus | "active" | "past") => {
    const params =
      status && status !== "active" && status !== "past"
        ? { status: status === "placed" ? "pending" : status === "on_the_way" ? "out_for_delivery" : status }
        : undefined;
    const orders = await api
      .get("/orders/my", { params })
      .then((res) => asArray(unwrapData(res.data)).map(mapOrder));

    if (status === "active") {
      return orders.filter((order) => !["delivered", "cancelled"].includes(order.status));
    }
    if (status === "past") {
      return orders.filter((order) => ["delivered", "cancelled"].includes(order.status));
    }
    return orders;
  },

  detail: (id: string) => api.get(`/orders/${id}`).then((res) => unwrapOrder(res.data)),

  place: (payload: PlaceOrderPayload) =>
    api
      .post("/orders", {
        addressId: payload.addressId,
        paymentMethod: PAYMENT_TO_BACKEND[payload.paymentMethod] ?? "cod",
        specialInstructions: payload.notes,
      })
      .then((res) => unwrapOrder(res.data)),

  cancel: (id: string, reason?: string) =>
    api.patch(`/orders/${id}/cancel`, { reason }).then((res) => unwrapOrder(res.data)),

  reorder: (id: string) =>
    api.post(`/orders/${id}/reorder`).then((res) => {
      const data = unwrapData<{ cart?: unknown }>(res.data);
      return mapCart(data && typeof data === "object" && "cart" in data ? data.cart : data);
    }),

  track: (id: string) => api.get(`/orders/${id}/track`).then((res) => unwrapOrder(res.data)),
};
