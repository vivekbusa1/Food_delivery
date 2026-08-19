import api, { unwrapEntity, unwrapPaginated } from './api';
import type { Coupon, Paginated, QueryParams } from '@/types';

const mapCoupon = (c: Record<string, unknown>): Coupon => ({
  id: String(c.id ?? c._id ?? ''),
  code: String(c.code ?? ''),
  description: c.description ? String(c.description) : undefined,
  discountType: String(c.discountType ?? 'percentage') as Coupon['discountType'],
  discountValue: Number(c.discountValue ?? 0),
  maxDiscount:
    c.maxDiscountAmount != null
      ? Number(c.maxDiscountAmount)
      : c.maxDiscount != null
        ? Number(c.maxDiscount)
        : undefined,
  minOrderValue:
    c.minOrderAmount != null
      ? Number(c.minOrderAmount)
      : c.minOrderValue != null
        ? Number(c.minOrderValue)
        : undefined,
  usageLimit: c.usageLimit != null ? Number(c.usageLimit) : undefined,
  usagePerUser:
    c.usageLimitPerUser != null
      ? Number(c.usageLimitPerUser)
      : c.usagePerUser != null
        ? Number(c.usagePerUser)
        : undefined,
  usedCount: Number(c.usedCount ?? 0),
  isActive: c.isActive !== false,
  startDate: String(c.validFrom ?? c.startDate ?? ''),
  endDate: String(c.validUntil ?? c.endDate ?? ''),
  createdAt: String(c.createdAt ?? ''),
});

const toBackendPayload = (payload: Partial<Coupon>) => {
  const body: Record<string, unknown> = {};
  if (payload.code != null) body.code = payload.code;
  if (payload.description != null) body.description = payload.description;
  if (payload.discountType != null) body.discountType = payload.discountType;
  if (payload.discountValue != null) body.discountValue = payload.discountValue;
  if (payload.maxDiscount != null) body.maxDiscountAmount = payload.maxDiscount;
  if (payload.minOrderValue != null) body.minOrderAmount = payload.minOrderValue;
  if (payload.usageLimit != null) body.usageLimit = payload.usageLimit;
  if (payload.usagePerUser != null) body.usageLimitPerUser = payload.usagePerUser;
  if (payload.isActive != null) body.isActive = payload.isActive;
  if (payload.startDate) body.validFrom = payload.startDate;
  if (payload.endDate) body.validUntil = payload.endDate;
  return body;
};

export const couponsService = {
  list: async (params: QueryParams = {}): Promise<Paginated<Coupon>> => {
    const res = await api.get('/coupons', { params });
    const page = unwrapPaginated<Record<string, unknown>>(res);
    return { ...page, items: page.items.map(mapCoupon) };
  },
  get: async (id: string): Promise<Coupon> => {
    const res = await api.get(`/coupons/${id}`);
    return mapCoupon(unwrapEntity(res, 'coupon'));
  },
  create: async (payload: Partial<Coupon>): Promise<Coupon> => {
    const res = await api.post('/coupons', toBackendPayload(payload));
    return mapCoupon(unwrapEntity(res, 'coupon'));
  },
  update: async (id: string, payload: Partial<Coupon>): Promise<Coupon> => {
    const res = await api.patch(`/coupons/${id}`, toBackendPayload(payload));
    return mapCoupon(unwrapEntity(res, 'coupon'));
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/coupons/${id}`);
  },
  toggleActive: async (id: string, isActive: boolean): Promise<Coupon> => {
    const res = await api.patch(`/coupons/${id}`, { isActive });
    return mapCoupon(unwrapEntity(res, 'coupon'));
  },
};
