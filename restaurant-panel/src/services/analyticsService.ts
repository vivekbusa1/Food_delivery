import { apiClient } from './apiClient';
import { getMyRestaurantId } from './restaurantService';
import type { AnalyticsData, AnalyticsRange, ApiResponse, OrderStatus } from '@/types';

type BackendOrderItem = { food?: string; name?: string; quantity?: number; totalPrice?: number };
type BackendOrder = {
  _id?: string;
  id?: string;
  user?: { _id?: string } | string;
  items?: BackendOrderItem[];
  total?: number;
  status?: OrderStatus;
  createdAt?: string;
};

function rangeToDays(range: AnalyticsRange): number {
  switch (range) {
    case '7d':
      return 7;
    case '30d':
      return 30;
    case '90d':
      return 90;
    case 'month':
      return 30;
    case 'year':
      return 365;
    default:
      return 7;
  }
}

function percentChange(current: number, previous: number): number {
  if (!previous) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

/**
 * Backend gap: there is no `/restaurants/:id/analytics` (or similar) endpoint, so this computes
 * real analytics client-side from the restaurant's actual orders (`GET /orders/restaurant/:id`)
 * instead of calling a path that doesn't exist.
 */
export const analyticsService = {
  async getAnalytics(range: AnalyticsRange): Promise<AnalyticsData> {
    const restaurantId = await getMyRestaurantId();
    const days = rangeToDays(range);
    const windowStart = new Date();
    windowStart.setDate(windowStart.getDate() - days);
    const previousWindowStart = new Date();
    previousWindowStart.setDate(previousWindowStart.getDate() - days * 2);

    const { data } = await apiClient.get<ApiResponse<BackendOrder[]> & { meta?: { total?: number } }>(
      `/orders/restaurant/${restaurantId}`,
      { params: { limit: 200 } }
    );
    const orders = data.data ?? [];

    const currentOrders = orders.filter((o) => o.createdAt && new Date(o.createdAt) >= windowStart);
    const previousOrders = orders.filter(
      (o) =>
        o.createdAt &&
        new Date(o.createdAt) >= previousWindowStart &&
        new Date(o.createdAt) < windowStart
    );

    const isRevenueCounted = (status?: OrderStatus) =>
      status === 'delivered' || status === 'completed';

    const totalRevenue = currentOrders
      .filter((o) => isRevenueCounted(o.status))
      .reduce((sum, o) => sum + Number(o.total ?? 0), 0);
    const previousRevenue = previousOrders
      .filter((o) => isRevenueCounted(o.status))
      .reduce((sum, o) => sum + Number(o.total ?? 0), 0);

    const totalOrders = currentOrders.length;
    const previousOrdersCount = previousOrders.length;

    const customerIds = new Set(
      currentOrders.map((o) => (typeof o.user === 'string' ? o.user : o.user?._id)).filter(Boolean)
    );
    const previousCustomerIds = new Set(
      previousOrders.map((o) => (typeof o.user === 'string' ? o.user : o.user?._id)).filter(Boolean)
    );
    const newCustomers = [...customerIds].filter((id) => !previousCustomerIds.has(id)).length;

    const cancelledCount = currentOrders.filter(
      (o) => o.status === 'cancelled' || o.status === 'rejected'
    ).length;

    const revenueByDate = new Map<string, { revenue: number; orders: number }>();
    currentOrders.forEach((o) => {
      const date = String(o.createdAt ?? '').slice(0, 10);
      if (!date) return;
      const entry = revenueByDate.get(date) ?? { revenue: 0, orders: 0 };
      if (isRevenueCounted(o.status)) entry.revenue += Number(o.total ?? 0);
      entry.orders += 1;
      revenueByDate.set(date, entry);
    });
    const revenueTrend = [...revenueByDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, revenue: v.revenue, orders: v.orders }));

    const itemStats = new Map<string, { name: string; quantity: number; revenue: number }>();
    currentOrders.forEach((o) => {
      (o.items ?? []).forEach((item) => {
        const key = String(item.food ?? item.name ?? '');
        if (!key) return;
        const entry = itemStats.get(key) ?? { name: String(item.name ?? ''), quantity: 0, revenue: 0 };
        entry.quantity += Number(item.quantity ?? 0);
        entry.revenue += Number(item.totalPrice ?? 0);
        itemStats.set(key, entry);
      });
    });
    const topSellingItems = [...itemStats.entries()]
      .sort(([, a], [, b]) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(([foodId, v]) => ({ foodId, name: v.name, quantity: v.quantity, revenue: v.revenue }));

    const ordersByStatus: Partial<Record<OrderStatus, number>> = {};
    currentOrders.forEach((o) => {
      if (!o.status) return;
      ordersByStatus[o.status] = (ordersByStatus[o.status] ?? 0) + 1;
    });

    return {
      summary: {
        totalRevenue,
        totalOrders,
        avgOrderValue: totalOrders ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0,
        totalCustomers: customerIds.size,
        newCustomers,
        revenueChangePercent: percentChange(totalRevenue, previousRevenue),
        ordersChangePercent: percentChange(totalOrders, previousOrdersCount),
        avgRating: 0,
        cancellationRate: totalOrders ? Math.round((cancelledCount / totalOrders) * 1000) / 10 : 0,
      },
      revenueTrend,
      topSellingItems,
      ordersByStatus,
    };
  },
};
