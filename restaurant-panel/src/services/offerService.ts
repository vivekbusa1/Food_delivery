import { apiClient } from './apiClient';
import { normalizeId, resolveRestaurantId } from '@/utils/restaurantSession';
import type { ApiResponse, Offer, OfferPayload } from '@/types';

function mapOffer(raw: Record<string, unknown>): Offer {
  const o = normalizeId(raw) as Record<string, unknown>;
  return {
    id: String(o.id ?? ''),
    title: String(o.title ?? ''),
    description: o.description ? String(o.description) : undefined,
    code: String(o.code ?? o.title ?? ''),
    type: String(o.discountType ?? o.type ?? 'percentage') as Offer['type'],
    value: Number(o.discountValue ?? o.value ?? 0),
    minOrderValue: o.minOrderAmount != null ? Number(o.minOrderAmount) : o.minOrderValue != null ? Number(o.minOrderValue) : undefined,
    maxDiscount:
      o.maxDiscountAmount != null
        ? Number(o.maxDiscountAmount)
        : o.maxDiscount != null
          ? Number(o.maxDiscount)
          : undefined,
    startDate: String(o.validFrom ?? o.startDate ?? ''),
    endDate: String(o.validUntil ?? o.endDate ?? ''),
    isActive: o.isActive !== false,
    usageLimit: o.usageLimit != null ? Number(o.usageLimit) : undefined,
    usedCount: Number(o.usedCount ?? 0),
    createdAt: String(o.createdAt ?? ''),
  };
}

function toBackendPayload(payload: Partial<OfferPayload>, restaurantId?: string) {
  const body: Record<string, unknown> = {};
  if (payload.title != null) body.title = payload.title;
  if (payload.description != null) body.description = payload.description;
  if (payload.type != null && payload.type !== 'free_delivery') body.discountType = payload.type;
  if (payload.type === 'free_delivery') body.discountType = 'flat';
  if (payload.value != null) body.discountValue = payload.value;
  if (payload.maxDiscount != null) body.maxDiscountAmount = payload.maxDiscount;
  if (payload.startDate) body.validFrom = payload.startDate;
  if (payload.endDate) body.validUntil = payload.endDate;
  if (payload.isActive != null) body.isActive = payload.isActive;
  if (restaurantId) body.restaurant = restaurantId;
  return body;
}

export const offerService = {
  async list(): Promise<Offer[]> {
    const { data } = await apiClient.get<ApiResponse<{ offers?: Record<string, unknown>[] }>>('/offers/mine');
    return (data.data?.offers ?? []).map((item) => mapOffer(item));
  },

  async create(payload: OfferPayload): Promise<Offer> {
    const restaurantId = await resolveRestaurantId();
    const { data } = await apiClient.post<ApiResponse<{ offer?: Record<string, unknown> }>>(
      '/offers',
      toBackendPayload(payload, restaurantId)
    );
    return mapOffer(data.data?.offer || {});
  },

  async update(id: string, payload: Partial<OfferPayload>): Promise<Offer> {
    const { data } = await apiClient.patch<ApiResponse<{ offer?: Record<string, unknown> }>>(
      `/offers/${id}`,
      toBackendPayload(payload)
    );
    return mapOffer(data.data?.offer || {});
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/offers/${id}`);
  },

  async toggleActive(id: string, isActive: boolean): Promise<Offer> {
    const { data } = await apiClient.patch<ApiResponse<{ offer?: Record<string, unknown> }>>(
      `/offers/${id}`,
      { isActive }
    );
    return mapOffer(data.data?.offer || {});
  },
};
