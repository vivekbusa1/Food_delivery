import api, { unwrapEntity, unwrapPaginated } from './api';
import type { Order, Paginated, QueryParams, Restaurant } from '@/types';

const mapRestaurant = (r: Record<string, unknown>): Restaurant => {
  const address = r.address;
  const addressStr =
    typeof address === 'string'
      ? address
      : address && typeof address === 'object'
        ? [
            (address as Record<string, unknown>).street,
            (address as Record<string, unknown>).city,
            (address as Record<string, unknown>).state,
          ]
            .filter(Boolean)
            .join(', ')
        : String(r.city ?? '');

  return {
    id: String(r.id ?? r._id ?? ''),
    name: String(r.name ?? ''),
    email: String(r.email ?? ''),
    phone: String(r.phone ?? ''),
    logo:
      typeof r.logo === 'object' && r.logo
        ? String((r.logo as { url?: string }).url ?? '')
        : r.logo
          ? String(r.logo)
          : undefined,
    coverImage:
      typeof r.coverImage === 'object' && r.coverImage
        ? String((r.coverImage as { url?: string }).url ?? '')
        : undefined,
    address: addressStr,
    city: String(
      (typeof address === 'object' && address
        ? (address as Record<string, unknown>).city
        : r.city) ?? ''
    ),
    cuisines: Array.isArray(r.cuisines) ? (r.cuisines as string[]) : [],
    rating: Number(r.ratingsAverage ?? r.rating ?? 0),
    status: String(r.approvalStatus ?? r.status ?? 'pending') as Restaurant['status'],
    isOpen: Boolean(r.isOpen ?? r.isActive ?? false),
    commissionRate: Number(r.commissionPercent ?? r.commissionRate ?? 0),
    ownerName:
      typeof r.owner === 'object' && r.owner
        ? String((r.owner as { name?: string }).name ?? '')
        : undefined,
    totalOrders: Number(r.totalOrders ?? 0),
    createdAt: String(r.createdAt ?? ''),
  };
};

export const restaurantsService = {
  list: async (params: QueryParams): Promise<Paginated<Restaurant>> => {
    const query: QueryParams = { ...params };
    if (typeof query.status === 'string' && !query.approvalStatus) {
      if (query.status && query.status !== 'all') {
        query.approvalStatus = query.status;
      }
      delete query.status;
    }
    if (query.approvalStatus === 'all' || query.approvalStatus === '') {
      delete query.approvalStatus;
    }
    // Admin route returns all restaurants (pending included) when authenticated as admin.
    const res = await api.get('/admin/restaurants', { params: query });
    const page = unwrapPaginated<Record<string, unknown>>(res);
    return { ...page, items: page.items.map(mapRestaurant) };
  },
  get: async (id: string): Promise<Restaurant> => {
    const res = await api.get(`/restaurants/${id}`);
    return mapRestaurant(unwrapEntity(res, 'restaurant'));
  },
  getOrders: async (id: string, params: QueryParams = {}): Promise<Paginated<Order>> => {
    const res = await api.get(`/orders/restaurant/${id}`, { params });
    const page = unwrapPaginated<Record<string, unknown>>(res);
    return {
      ...page,
      items: page.items.map((order) => ({
        id: String(order.id ?? order._id ?? ''),
        orderNumber: String(order.orderNumber ?? order.id ?? order._id ?? ''),
        customer: { id: '', name: 'Customer', phone: '' },
        restaurant: { id, name: '' },
        items: [],
        subtotal: Number(order.subTotal ?? order.subtotal ?? 0),
        tax: Number(order.tax ?? order.taxAmount ?? 0),
        deliveryFee: Number(order.deliveryFee ?? 0),
        discount: Number(order.discount ?? 0),
        total: Number(order.total ?? 0),
        status: String(order.status ?? 'pending') as Order['status'],
        paymentStatus: String(order.paymentStatus ?? 'pending') as Order['paymentStatus'],
        paymentMethod: String(order.paymentMethod ?? ''),
        deliveryAddress: '',
        createdAt: String(order.createdAt ?? ''),
      })),
    };
  },
  update: async (id: string, payload: Partial<Restaurant>): Promise<Restaurant> => {
    const res = await api.patch(`/restaurants/${id}`, {
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      commissionPercent: payload.commissionRate,
      cuisines: payload.cuisines,
    });
    return mapRestaurant(unwrapEntity(res, 'restaurant'));
  },
  setStatus: async (
    id: string,
    status: Restaurant['status'],
    reason?: string
  ): Promise<Restaurant> => {
    const res = await api.patch(`/restaurants/${id}/approve`, {
      approvalStatus: status === 'suspended' ? 'rejected' : status,
      rejectionReason: reason,
    });
    return mapRestaurant(unwrapEntity(res, 'restaurant'));
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/restaurants/${id}`);
  },
};
