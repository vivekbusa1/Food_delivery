import { api } from "./api";
import { mapFood } from "./foodService";
import type { Cart, CartItem, CartItemOptionSelection, Coupon } from "../types";

export interface AddToCartPayload {
  foodId: string;
  quantity: number;
  selectedOptions?: CartItemOptionSelection[];
  notes?: string;
}

type CartEnvelope = { data: { cart: unknown } };

type RawCartItem = Record<string, unknown> & {
  _id?: string;
  id?: string;
  food?: unknown;
  variant?: { _id?: string; id?: string; name?: string; price?: number } | string | null;
  addons?: Array<{ _id?: string; id?: string; name?: string; price?: number } | string>;
  quantity?: number;
  price?: number;
  totalPrice?: number;
  itemTotal?: number;
  specialInstructions?: string;
  notes?: string;
  selectedOptions?: CartItemOptionSelection[];
};

type RawCoupon = Record<string, unknown> & {
  _id?: string;
  id?: string;
  code?: string;
  description?: string;
  discountType?: "percentage" | "flat";
  discountValue?: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  maxDiscountAmount?: number;
  expiresAt?: string;
  validUntil?: string;
};

type RawCart = Record<string, unknown> & {
  _id?: string;
  id?: string;
  restaurant?: string | { _id?: string; id?: string; name?: string } | null;
  restaurantId?: string | null;
  restaurantName?: string;
  items?: RawCartItem[];
  coupon?: RawCoupon | null;
  appliedCoupon?: Coupon | null;
  subTotal?: number;
  subtotal?: number;
  deliveryFee?: number;
  taxAmount?: number;
  taxes?: number;
  discount?: number;
  total?: number;
};

function mapCoupon(raw: unknown): Coupon | null {
  if (!raw || typeof raw !== "object") return null;
  const coupon = raw as RawCoupon;
  const id = String(coupon.id ?? coupon._id ?? "");
  if (!id && !coupon.code) return null;
  return {
    id,
    code: String(coupon.code ?? ""),
    description: String(coupon.description ?? ""),
    discountType: coupon.discountType === "flat" ? "flat" : "percentage",
    discountValue: Number(coupon.discountValue ?? 0),
    minOrderAmount: coupon.minOrderAmount != null ? Number(coupon.minOrderAmount) : undefined,
    maxDiscount:
      coupon.maxDiscount != null
        ? Number(coupon.maxDiscount)
        : coupon.maxDiscountAmount != null
          ? Number(coupon.maxDiscountAmount)
          : undefined,
    expiresAt: coupon.expiresAt
      ? String(coupon.expiresAt)
      : coupon.validUntil
        ? String(coupon.validUntil)
        : undefined,
  };
}

function mapSelectedOptions(item: RawCartItem): CartItemOptionSelection[] {
  if (Array.isArray(item.selectedOptions)) return item.selectedOptions;

  const options: CartItemOptionSelection[] = [];
  const variant = item.variant;
  if (variant && typeof variant === "object") {
    options.push({
      groupId: "variant",
      optionIds: [String(variant.name ?? variant.id ?? variant._id ?? "")].filter(Boolean),
    });
  }
  if (Array.isArray(item.addons) && item.addons.length > 0) {
    options.push({
      groupId: "addons",
      optionIds: item.addons
        .map((addon) =>
          typeof addon === "string"
            ? addon
            : String(addon.name ?? addon.id ?? addon._id ?? ""),
        )
        .filter(Boolean),
    });
  }
  return options;
}

export function mapCartItem(raw: unknown): CartItem {
  const item = (raw ?? {}) as RawCartItem;
  return {
    id: String(item.id ?? item._id ?? ""),
    food: mapFood(item.food),
    quantity: Number(item.quantity ?? 1),
    selectedOptions: mapSelectedOptions(item),
    notes: item.notes ? String(item.notes) : item.specialInstructions ? String(item.specialInstructions) : undefined,
    itemTotal: Number(item.itemTotal ?? item.totalPrice ?? 0),
  };
}

export function mapCart(raw: unknown): Cart {
  const cart = (raw ?? {}) as RawCart;
  const restaurant = cart.restaurant;
  const restaurantId =
    cart.restaurantId != null
      ? cart.restaurantId
        ? String(cart.restaurantId)
        : null
      : typeof restaurant === "string"
        ? restaurant
        : restaurant
          ? String(restaurant._id ?? restaurant.id ?? "")
          : null;
  const restaurantName =
    cart.restaurantName ??
    (typeof restaurant === "object" && restaurant ? String(restaurant.name ?? "") : undefined);

  return {
    id: String(cart.id ?? cart._id ?? ""),
    restaurantId: restaurantId || null,
    restaurantName: restaurantName || undefined,
    items: Array.isArray(cart.items) ? cart.items.map(mapCartItem) : [],
    subtotal: Number(cart.subtotal ?? cart.subTotal ?? 0),
    deliveryFee: Number(cart.deliveryFee ?? 0),
    taxes: Number(cart.taxes ?? cart.taxAmount ?? 0),
    discount: Number(cart.discount ?? 0),
    total: Number(cart.total ?? 0),
    appliedCoupon: cart.appliedCoupon ?? mapCoupon(cart.coupon),
  };
}

const unwrapCart = (res: { data: CartEnvelope }) => mapCart(res.data.data.cart);

export const cartService = {
  get: () => api.get<CartEnvelope>("/cart").then(unwrapCart),

  // Backend expects `food`/`specialInstructions` field names, not `foodId`/`notes`.
  // NOTE: the backend cart model only supports a single `variant` + `addons[]` per item,
  // it has no concept of the frontend's generic `selectedOptions` option groups, so that
  // field cannot be forwarded yet without a larger data-model change on one side.
  addItem: (payload: AddToCartPayload) =>
    api
      .post<CartEnvelope>("/cart/items", {
        food: payload.foodId,
        quantity: payload.quantity,
        specialInstructions: payload.notes,
      })
      .then(unwrapCart),

  updateItem: (itemId: string, quantity: number) =>
    api.patch<CartEnvelope>(`/cart/items/${itemId}`, { quantity }).then(unwrapCart),

  removeItem: (itemId: string) => api.delete<CartEnvelope>(`/cart/items/${itemId}`).then(unwrapCart),

  clear: () => api.delete<CartEnvelope>("/cart").then(unwrapCart),

  applyCoupon: (code: string) => api.post<CartEnvelope>("/cart/coupon", { code }).then(unwrapCart),

  removeCoupon: () => api.delete<CartEnvelope>("/cart/coupon").then(unwrapCart),
};
