import api, { unwrapEntity, unwrapPaginated } from './api';
import type { Order, OrderStatus, Paginated, QueryParams } from '@/types';

const toBackendStatus = (status: OrderStatus | string): string => {
  if (status === 'ready') return 'ready_for_pickup';
  if (status === 'refunded') return 'cancelled';
  return status;
};

const fromBackendStatus = (status?: string): OrderStatus => {
  if (status === 'ready_for_pickup') return 'ready';
  if (status === 'rejected') return 'cancelled';
  return String(status ?? 'pending') as OrderStatus;
};

const mapOrder = (order: Record<string, unknown>): Order => {
  const customer = (order.user || order.customer || {}) as Record<string, unknown>;
  const restaurant = (order.restaurant || {}) as Record<string, unknown>;
  const partnerRaw = order.deliveryPartner;
  const partner =
    partnerRaw && typeof partnerRaw === 'object'
      ? (partnerRaw as Record<string, unknown>)
      : ({} as Record<string, unknown>);
  const partnerUser =
    partner.user && typeof partner.user === 'object'
      ? (partner.user as Record<string, unknown>)
      : undefined;
  const address = order.deliveryAddress;
  const partnerId = String(partner.id ?? partner._id ?? '');

  return {
    id: String(order.id ?? order._id ?? ''),
    orderNumber: String(order.orderNumber ?? order.id ?? order._id ?? ''),
    customer: {
      id: String(customer.id ?? customer._id ?? ''),
      name: String(customer.name ?? 'Customer'),
      phone: String(customer.phone ?? ''),
    },
    restaurant: {
      id: String(restaurant.id ?? restaurant._id ?? ''),
      name: String(restaurant.name ?? 'Restaurant'),
    },
    deliveryPartner: partnerId
      ? {
          id: partnerId,
          name: String(partnerUser?.name ?? partner.name ?? ''),
          phone: String(partnerUser?.phone ?? partner.phone ?? ''),
        }
      : undefined,
    items: Array.isArray(order.items)
      ? (order.items as Array<Record<string, unknown>>).map((item) => ({
          id: String(item.id ?? item._id ?? ''),
          name: String(item.name ?? item.foodName ?? ''),
          quantity: Number(item.quantity ?? 0),
          price: Number(item.price ?? 0),
          total: Number(item.total ?? Number(item.price ?? 0) * Number(item.quantity ?? 0)),
        }))
      : [],
    subtotal: Number(order.subTotal ?? order.subtotal ?? 0),
    tax: Number(order.tax ?? order.taxAmount ?? 0),
    deliveryFee: Number(order.deliveryFee ?? 0),
    discount: Number(order.discount ?? 0),
    total: Number(order.total ?? 0),
    status: fromBackendStatus(String(order.status ?? 'pending')),
    paymentStatus: String(order.paymentStatus ?? 'pending') as Order['paymentStatus'],
    paymentMethod: String(order.paymentMethod ?? ''),
    deliveryAddress:
      typeof address === 'string'
        ? address
        : address && typeof address === 'object'
          ? [
              (address as Record<string, unknown>).addressLine1,
              (address as Record<string, unknown>).city,
              (address as Record<string, unknown>).zipCode ??
                (address as Record<string, unknown>).pincode,
            ]
              .filter(Boolean)
              .join(', ')
          : '',
    createdAt: String(order.createdAt ?? ''),
  };
};

export const ordersService = {
  list: async (params: QueryParams): Promise<Paginated<Order>> => {
    const query = { ...params };
    if (typeof query.status === 'string') {
      query.status = toBackendStatus(query.status);
    }
    const res = await api.get('/admin/orders', { params: query });
    const page = unwrapPaginated<Record<string, unknown>>(res);
    return { ...page, items: page.items.map(mapOrder) };
  },
  get: async (id: string): Promise<Order> => {
    const res = await api.get(`/orders/${id}`);
    return mapOrder(unwrapEntity(res, 'order'));
  },
  updateStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    if (status === 'refunded') {
      throw new Error('Use payment refund instead of setting order status to refunded');
    }
    const res = await api.patch(`/orders/${id}/status`, { status: toBackendStatus(status) });
    return mapOrder(unwrapEntity(res, 'order'));
  },
  refund: async (id: string, payload: { amount: number; reason: string }): Promise<Order> => {
    await api.post('/payments/refund', { orderId: id, ...payload });
    return ordersService.get(id);
  },
  assignPartner: async (id: string, partnerId: string): Promise<Order> => {
    const res = await api.patch(`/orders/${id}/assign-delivery`, { deliveryPartnerId: partnerId });
    return mapOrder(unwrapEntity(res, 'order'));
  },
};
