export type OfferType = 'percentage' | 'flat' | 'free_delivery';

export interface Offer {
  id: string;
  title: string;
  description?: string;
  code: string;
  type: OfferType;
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
  createdAt: string;
}

export interface OfferPayload {
  title: string;
  description?: string;
  code: string;
  type: OfferType;
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  isActive?: boolean;
}
