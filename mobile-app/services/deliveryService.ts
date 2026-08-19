import { api } from "./api";
import { mapOrder } from "./orderService";
import { asArray, unwrapCollection, unwrapData } from "../utils/apiHelpers";
import type { DeliveryOrderRequest, DeliveryWallet, Order, User } from "../types";
import { fromBackendRole } from "./authService";
import { pickId } from "../utils/apiHelpers";

export interface DeliveryDashboardSummary {
  isOnline: boolean;
  todayEarnings: number;
  todayDeliveries: number;
  rating: number;
  activeOrder: Order | null;
}

function mapPartnerUser(raw: unknown): User {
  const partner = (raw ?? {}) as Record<string, unknown> & {
    user?: Record<string, unknown>;
  };
  const user = partner.user ?? partner;
  return {
    id: pickId(user as Record<string, unknown>),
    name: String(user.name ?? ""),
    email: String(user.email ?? ""),
    phone: String(user.phone ?? ""),
    avatarUrl:
      typeof user.avatar === "object" && user.avatar
        ? String((user.avatar as { url?: string }).url ?? "") || null
        : null,
    role: fromBackendRole(user.role ?? "delivery"),
    createdAt: String(user.createdAt ?? ""),
  };
}

function mapAvailableOrder(raw: unknown): DeliveryOrderRequest {
  const order = mapOrder(raw);
  return {
    order,
    distanceKm: Number((raw as { distanceKm?: number })?.distanceKm ?? 0),
    estimatedEarnings: Number(
      (raw as { estimatedEarnings?: number; deliveryFee?: number })?.estimatedEarnings ??
        (raw as { deliveryFee?: number })?.deliveryFee ??
        0,
    ),
    expiresInSeconds: Number((raw as { expiresInSeconds?: number })?.expiresInSeconds ?? 120),
  };
}

export const deliveryService = {
  // No dedicated dashboard endpoint — derive a summary from /delivery/me.
  dashboard: () =>
    api.get("/delivery/me").then((res) => {
      const data = unwrapData<{ partner?: Record<string, unknown> }>(res.data);
      const partner = (data && typeof data === "object" && "partner" in data ? data.partner : data) as
        | Record<string, unknown>
        | undefined;
      const active = partner?.activeOrder ? mapOrder(partner.activeOrder) : null;
      return {
        isOnline: Boolean(partner?.isOnline),
        todayEarnings: Number(partner?.totalEarnings ?? 0),
        todayDeliveries: Number(partner?.totalDeliveries ?? 0),
        rating: Number(partner?.ratingsAverage ?? 0),
        activeOrder: active,
      } satisfies DeliveryDashboardSummary;
    }),

  setOnlineStatus: (isOnline: boolean) =>
    api
      .patch("/delivery/availability", { isOnline, isAvailable: isOnline })
      .then((res) => unwrapData(res.data)),

  availableOrders: () =>
    api
      .get("/delivery/orders/available")
      .then((res) => unwrapCollection(res.data, "orders").map(mapAvailableOrder)),

  acceptOrder: (orderId: string) =>
    api.patch(`/delivery/orders/${orderId}/accept`).then((res) => {
      const data = unwrapData<{ order?: unknown }>(res.data);
      return mapOrder(data && typeof data === "object" && "order" in data ? data.order : data);
    }),

  rejectOrder: (orderId: string) =>
    api.patch(`/delivery/orders/${orderId}/reject`).then((res) => unwrapData(res.data)),

  updateOrderStatus: (orderId: string, status: Order["status"]) => {
    const backendStatus =
      status === "placed"
        ? "pending"
        : status === "on_the_way"
          ? "out_for_delivery"
          : status === "picked_up"
            ? "out_for_delivery"
            : status;
    return api.patch(`/delivery/orders/${orderId}/status`, { status: backendStatus }).then((res) => {
      const data = unwrapData<{ order?: unknown }>(res.data);
      return mapOrder(data && typeof data === "object" && "order" in data ? data.order : data);
    });
  },

  activeOrder: () =>
    api.get("/delivery/me").then((res) => {
      const data = unwrapData<{ partner?: { activeOrder?: unknown } }>(res.data);
      const partner = data && typeof data === "object" && "partner" in data ? data.partner : data;
      const active = (partner as { activeOrder?: unknown } | undefined)?.activeOrder;
      return active ? mapOrder(active) : null;
    }),

  history: () =>
    api.get("/delivery/orders/my").then((res) => asArray(unwrapData(res.data)).map(mapOrder)),

  wallet: () =>
    api.get("/delivery/wallet").then((res) => {
      const data = unwrapData<{ wallet?: DeliveryWallet } | DeliveryWallet>(res.data);
      if (data && typeof data === "object" && "wallet" in data) {
        return (data as { wallet: DeliveryWallet }).wallet;
      }
      return data as DeliveryWallet;
    }),

  updateLocation: (latitude: number, longitude: number) =>
    api
      .patch("/delivery/location", { lat: latitude, lng: longitude })
      .then((res) => unwrapData(res.data)),

  profile: () => api.get("/delivery/me").then((res) => mapPartnerUser(unwrapData(res.data))),
};
