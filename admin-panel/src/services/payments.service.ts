import api, { unwrapEntity, unwrapPaginated } from './api';
import type { Paginated, Payment, QueryParams, RefundRequest } from '@/types';

const mapPayment = (p: Record<string, unknown>): Payment => {
  const order = (p.order || {}) as Record<string, unknown>;
  const user = (p.user || p.customer || {}) as Record<string, unknown>;
  return {
    id: String(p.id ?? ''),
    orderNumber: String(order.orderNumber ?? p.orderId ?? p.order ?? ''),
    customer: {
      id: String(user.id ?? ''),
      name: String(user.name ?? 'Customer'),
    },
    amount: Number(p.amount ?? 0),
    method: String(p.method ?? p.paymentMethod ?? ''),
    status: String(p.status ?? 'pending').replace('paid', 'success') as Payment['status'],
    gatewayRef: p.gatewayPaymentId
      ? String(p.gatewayPaymentId)
      : p.transactionId
        ? String(p.transactionId)
        : undefined,
    createdAt: String(p.createdAt ?? ''),
  };
};

export const paymentsService = {
  list: async (params: QueryParams = {}): Promise<Paginated<Payment>> => {
    const res = await api.get('/admin/payments', { params });
    const page = unwrapPaginated<Record<string, unknown>>(res);
    return { ...page, items: page.items.map(mapPayment) };
  },
  get: async (id: string): Promise<Payment> => {
    const res = await api.get(`/payments/${id}`);
    return mapPayment(unwrapEntity(res, 'payment'));
  },
  listRefunds: async (_params: QueryParams = {}): Promise<Paginated<RefundRequest>> => ({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  }),
  updateRefundStatus: async (
    _id: string,
    _status: RefundRequest['status']
  ): Promise<RefundRequest> => {
    throw new Error('Refund queue is not available on this API yet');
  },
};
