import api, { unwrap } from './api';
import type { DashboardStats, QueryParams, TimeSeriesPoint, TopEntity } from '@/types';

export interface ReportFilters extends QueryParams {
  from?: string;
  to?: string;
}

export const analyticsService = {
  dashboardStats: async (): Promise<DashboardStats> => {
    const res = await api.get('/admin/dashboard');
    const data = unwrap<{
      users?: { total?: number };
      restaurants?: { total?: number };
      orders?: { total?: number; active?: number };
      revenue?: { total?: number };
      deliveryPartners?: { total?: number };
    }>(res);

    return {
      totalRevenue: data.revenue?.total ?? 0,
      revenueChange: 0,
      totalOrders: data.orders?.total ?? 0,
      ordersChange: 0,
      totalUsers: data.users?.total ?? 0,
      usersChange: 0,
      totalRestaurants: data.restaurants?.total ?? 0,
      restaurantsChange: 0,
      activeDeliveryPartners: data.deliveryPartners?.total ?? 0,
      pendingOrders: data.orders?.active ?? 0,
    };
  },

  revenueSeries: async (params: ReportFilters = {}): Promise<TimeSeriesPoint[]> => {
    const res = await api.get('/admin/analytics/revenue', { params });
    const data = unwrap<{ revenueByDate?: Array<{ _id?: string; id?: string; total: number }> }>(res);
    return (data.revenueByDate ?? []).map((row) => ({
      label: String(row._id ?? row.id ?? ''),
      value: row.total,
    }));
  },

  ordersSeries: async (params: ReportFilters = {}): Promise<TimeSeriesPoint[]> => {
    const res = await api.get('/admin/analytics/orders', { params });
    const data = unwrap<{ statusBreakdown?: Array<{ _id?: string; id?: string; count: number }> }>(res);
    return (data.statusBreakdown ?? []).map((row) => ({
      label: String(row._id ?? row.id ?? ''),
      value: row.count,
    }));
  },

  usersSeries: async (_params: ReportFilters = {}): Promise<TimeSeriesPoint[]> => [],
  restaurantsSeries: async (_params: ReportFilters = {}): Promise<TimeSeriesPoint[]> => [],

  topFoods: async (params: ReportFilters = {}): Promise<TopEntity[]> => {
    const res = await api.get('/admin/analytics/top-foods', { params });
    const data = unwrap<{ topFoods?: Array<Record<string, unknown>> }>(res);
    return (data.topFoods ?? []).map((food) => ({
      id: String(food.id ?? ''),
      name: String(food.name ?? ''),
      image:
        Array.isArray(food.images) && food.images[0]
          ? String((food.images[0] as { url?: string }).url ?? food.images[0])
          : undefined,
      value: Number(food.totalOrders ?? 0),
      metric: 'orders',
    }));
  },

  topRestaurants: async (params: ReportFilters = {}): Promise<TopEntity[]> => {
    const res = await api.get('/admin/analytics/top-restaurants', { params });
    const data = unwrap<{
      topRestaurants?: Array<{
        id?: string;
        totalOrders?: number;
        totalRevenue?: number;
        restaurant?: { name?: string; logo?: { url?: string } | string };
      }>;
    }>(res);
    return (data.topRestaurants ?? []).map((row) => ({
      id: String(row.id ?? ''),
      name: String(row.restaurant?.name ?? 'Restaurant'),
      image:
        typeof row.restaurant?.logo === 'object'
          ? row.restaurant?.logo?.url
          : row.restaurant?.logo,
      value: Number(row.totalRevenue ?? row.totalOrders ?? 0),
      metric: 'revenue',
    }));
  },

  salesByCategory: async (_params: ReportFilters = {}): Promise<TopEntity[]> => [],

  reportSummary: async (_params: ReportFilters = {}): Promise<Record<string, number>> => {
    const stats = await analyticsService.dashboardStats();
    return {
      totalRevenue: stats.totalRevenue,
      totalOrders: stats.totalOrders,
      totalUsers: stats.totalUsers,
      totalRestaurants: stats.totalRestaurants,
    };
  },

  exportReport: async (_type: string, _params: ReportFilters = {}): Promise<Blob> => {
    const summary = await analyticsService.reportSummary();
    const csv = ['metric,value', ...Object.entries(summary).map(([k, v]) => `${k},${v}`)].join('\n');
    return new Blob([csv], { type: 'text/csv' });
  },
};
