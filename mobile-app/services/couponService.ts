import { api } from "./api";
import { pickId, unwrapCollection, unwrapData } from "../utils/apiHelpers";
import type { Coupon } from "../types";

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

export function mapCoupon(raw: unknown): Coupon {
  const coupon = (raw ?? {}) as RawCoupon;
  return {
    id: pickId(coupon),
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

export const couponService = {
  // Public customer endpoint is GET /coupons/active (`GET /coupons` is admin-only).
  list: () =>
    api.get("/coupons/active").then((res) => unwrapCollection(res.data, "coupons").map(mapCoupon)),

  validate: (code: string, restaurantId?: string | null, subTotal?: number) =>
    api
      .post("/coupons/validate", { code, restaurantId, subTotal })
      .then((res) => {
        const data = unwrapData<{ coupon?: unknown }>(res.data);
        return mapCoupon(data?.coupon ?? data);
      }),
};
