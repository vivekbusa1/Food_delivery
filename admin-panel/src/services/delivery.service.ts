import api, { unwrapEntity, unwrapPaginated } from './api';
import type { DeliveryAssignment, DeliveryPartner, Paginated, QueryParams } from '@/types';
import { ordersService } from './orders.service';

const mapPartner = (p: Record<string, unknown>): DeliveryPartner => {
  const user = (p.user || {}) as Record<string, unknown>;
  return {
    id: String(p.id ?? ''),
    name: String(user.name ?? p.name ?? ''),
    email: String(user.email ?? p.email ?? ''),
    phone: String(user.phone ?? p.phone ?? ''),
    avatar:
      typeof user.avatar === 'object' && user.avatar
        ? String((user.avatar as { url?: string }).url ?? '')
        : undefined,
    vehicleType: String(p.vehicleType ?? 'bike'),
    vehicleNumber: p.vehicleNumber ? String(p.vehicleNumber) : undefined,
    status:
      p.approvalStatus === 'approved'
        ? p.isActive === false
          ? 'inactive'
          : 'active'
        : p.approvalStatus === 'rejected'
          ? 'blocked'
          : 'inactive',
    isOnline: Boolean(p.isOnline ?? p.isAvailable),
    rating: Number(p.ratingsAverage ?? p.rating ?? 0),
    totalDeliveries: Number(p.totalDeliveries ?? 0),
    earnings: Number(p.totalEarnings ?? p.earnings ?? 0),
    documentsVerified: Boolean(p.documentsVerified ?? p.approvalStatus === 'approved'),
    createdAt: String(p.createdAt ?? ''),
  };
};

export const deliveryPartnersService = {
  list: async (params: QueryParams = {}): Promise<Paginated<DeliveryPartner>> => {
    const res = await api.get('/delivery/admin/partners', { params });
    const page = unwrapPaginated<Record<string, unknown>>(res);
    return { ...page, items: page.items.map(mapPartner) };
  },
  get: async (id: string): Promise<DeliveryPartner> => {
    const list = await deliveryPartnersService.list({ limit: 100 });
    const found = list.items.find((item) => item.id === id);
    if (!found) throw new Error('Delivery partner not found');
    return found;
  },
  create: async (
    _payload: Partial<DeliveryPartner> & { password?: string }
  ): Promise<DeliveryPartner> => {
    throw new Error('Create partner via the delivery registration flow');
  },
  update: async (
    _id: string,
    _payload: Partial<DeliveryPartner>
  ): Promise<DeliveryPartner> => {
    throw new Error('Partner profile updates are managed by the partner app');
  },
  remove: async (_id: string): Promise<void> => {
    throw new Error('Deleting delivery partners is not supported by the API');
  },
  setStatus: async (id: string, status: DeliveryPartner['status']): Promise<DeliveryPartner> => {
    const approvalStatus = status === 'active' ? 'approved' : 'rejected';
    const res = await api.patch(`/delivery/admin/partners/${id}/approve`, { approvalStatus });
    return mapPartner(unwrapEntity(res, 'partner'));
  },
  verifyDocuments: async (id: string, documentsVerified: boolean): Promise<DeliveryPartner> => {
    const res = await api.patch(`/delivery/admin/partners/${id}/approve`, {
      approvalStatus: documentsVerified ? 'approved' : 'rejected',
    });
    return mapPartner(unwrapEntity(res, 'partner'));
  },
};

export const deliveryManagementService = {
  listAssignments: async (params: QueryParams = {}): Promise<Paginated<DeliveryAssignment>> => {
    const status =
      params.status === 'ready' || params.status == null || params.status === ''
        ? 'ready_for_pickup'
        : params.status === 'ready_for_pickup'
          ? 'ready_for_pickup'
          : params.status;
    const orders = await ordersService.list({
      ...params,
      status,
    });
    return {
      ...orders,
      items: orders.items.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        partner: order.deliveryPartner
          ? { id: order.deliveryPartner.id, name: order.deliveryPartner.name }
          : undefined,
        status: (order.deliveryPartner ? 'assigned' : 'unassigned') as DeliveryAssignment['status'],
        pickupAddress: order.restaurant.name,
        dropAddress: order.deliveryAddress || order.customer.name,
        createdAt: order.createdAt,
      })),
    };
  },
  assign: async (assignmentId: string, partnerId: string): Promise<DeliveryAssignment> => {
    const order = await ordersService.assignPartner(assignmentId, partnerId);
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      partner: order.deliveryPartner
        ? { id: order.deliveryPartner.id, name: order.deliveryPartner.name }
        : undefined,
      status: 'assigned',
      pickupAddress: order.restaurant.name,
      dropAddress: order.deliveryAddress || order.customer.name,
      createdAt: order.createdAt,
    };
  },
  reassign: async (assignmentId: string, partnerId: string): Promise<DeliveryAssignment> =>
    deliveryManagementService.assign(assignmentId, partnerId),
  cancel: async (assignmentId: string, _reason?: string): Promise<DeliveryAssignment> => {
    const order = await ordersService.updateStatus(assignmentId, 'cancelled');
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: 'failed',
      pickupAddress: order.restaurant.name,
      dropAddress: order.deliveryAddress || order.customer.name,
      createdAt: order.createdAt,
    };
  },
};
