import type { OrderStatus } from './order';

export type AnalyticsRange = '7d' | '30d' | '90d' | 'month' | 'year';

export interface RevenuePoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopSellingItem {
  foodId: string;
  name: string;
  quantity: number;
  revenue: number;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  totalCustomers: number;
  newCustomers: number;
  revenueChangePercent: number;
  ordersChangePercent: number;
  avgRating: number;
  cancellationRate: number;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  revenueTrend: RevenuePoint[];
  topSellingItems: TopSellingItem[];
  ordersByStatus: Partial<Record<OrderStatus, number>>;
}
