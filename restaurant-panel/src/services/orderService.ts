import { apiClient } from './apiClient';
import { getMyRestaurantId } from './restaurantService';
import type {
  ApiResponse,
  AssignDeliveryPayload,
  DeliveryPartner,
  Order,
  OrderItem,
  OrderListParams,
  OrderStatus,
  PaginatedResponse,
  UpdateOrderStatusPayload,
} from '@/types';

type BackendOrderItem = {
  _id?: string;
  food?: string;
  name?: string;
  image?: string;
  variant?: { name?: string } | null;
  addons?: Array<{ name?: string; price?: number }>;
  quantity?: number;
  price?: number;
};

type BackendOrder = {
  _id?: string;
  id?: string;
  orderNumber?: string;
  user?: { _id?: string; name?: string; phone?: string } | string;
  items?: BackendOrderItem[];
  subTotal?: number;
  taxAmount?: number;
  deliveryFee?: number;
  discount?: number;
  total?: number;
  status?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  deliveryAddress?: Record<string, unknown> | string;
  deliveryPartner?: {
    _id?: string;
    user?: { name?: string; phone?: string };
    vehicleNumber?: string;
  } | null;
  specialInstructions?: string;
  cancellationReason?: string;
  createdAt?: string;
  updatedAt?: string;
  estimatedDeliveryTime?: string;
};

/** Panel UI statuses ↔ backend Order.status enum */
function toBackendStatus(status?: string): string | undefined {
  if (!status || status === 'all') return undefined;
  if (status === 'accepted') return 'confirmed';
  if (status === 'ready') return 'ready_for_pickup';
  if (status === 'completed') return 'delivered';
  return status;
}

function fromBackendStatus(status?: string): OrderStatus {
  if (status === 'confirmed') return 'accepted';
  if (status === 'ready_for_pickup') return 'ready';
  return (status ?? 'pending') as OrderStatus;
}

function mapOrderItem(item: BackendOrderItem): OrderItem {
  return {
    foodId: String(item.food ?? ''),
    name: String(item.name ?? ''),
    quantity: Number(item.quantity ?? 0),
    price: Number(item.price ?? 0),
    variant: item.variant?.name,
    addOns: (item.addons ?? []).map((a) => ({ name: String(a.name ?? ''), price: Number(a.price ?? 0) })),
    imageUrl: item.image,
  };
}

function mapOrder(order: BackendOrder): Order {
  const address = order.deliveryAddress;
  const addressStr =
    typeof address === 'string'
      ? address
      : address && typeof address === 'object'
        ? [
            (address as Record<string, unknown>).addressLine1,
            (address as Record<string, unknown>).city,
            (address as Record<string, unknown>).zipCode,
          ]
            .filter(Boolean)
            .join(', ')
        : '';

  const customer = typeof order.user === 'object' && order.user ? order.user : undefined;

  return {
    id: String(order.id ?? order._id ?? ''),
    orderNumber: String(order.orderNumber ?? ''),
    customer: {
      id: String(customer?._id ?? ''),
      name: String(customer?.name ?? 'Customer'),
      phone: String(customer?.phone ?? ''),
    },
    items: (order.items ?? []).map(mapOrderItem),
    subtotal: Number(order.subTotal ?? 0),
    tax: Number(order.taxAmount ?? 0),
    deliveryFee: Number(order.deliveryFee ?? 0),
    discount: Number(order.discount ?? 0),
    total: Number(order.total ?? 0),
    status: fromBackendStatus(order.status),
    paymentMethod: String(order.paymentMethod ?? ''),
    paymentStatus: (order.paymentStatus ?? 'pending') as Order['paymentStatus'],
    deliveryAddress: addressStr,
    deliveryPartner: order.deliveryPartner
      ? {
          id: String(order.deliveryPartner._id ?? ''),
          name: String(order.deliveryPartner.user?.name ?? ''),
          phone: String(order.deliveryPartner.user?.phone ?? ''),
          vehicleNumber: order.deliveryPartner.vehicleNumber,
        }
      : null,
    specialInstructions: order.specialInstructions,
    rejectionReason: order.cancellationReason,
    createdAt: String(order.createdAt ?? ''),
    updatedAt: String(order.updatedAt ?? order.createdAt ?? ''),
    estimatedDeliveryTime: order.estimatedDeliveryTime,
  };
}

export const orderService = {
  async list(params: OrderListParams): Promise<PaginatedResponse<Order>> {
    const restaurantId = await getMyRestaurantId();
    const { data } = await apiClient.get<ApiResponse<BackendOrder[]> & { meta: PaginatedResponse<Order>['meta'] }>(
      `/orders/restaurant/${restaurantId}`,
      {
        params: {
          page: params.page,
          limit: params.limit,
          status: toBackendStatus(params.status),
          search: params.search,
        },
      }
    );
    return {
      success: data.success,
      message: data.message,
      data: (data.data ?? []).map(mapOrder),
      meta: data.meta,
    };
  },

  async getById(id: string): Promise<Order> {
    const { data } = await apiClient.get<ApiResponse<{ order: BackendOrder }>>(`/orders/${id}`);
    return mapOrder(data.data.order);
  },

  async updateStatus(id: string, payload: UpdateOrderStatusPayload): Promise<Order> {
    const { data } = await apiClient.patch<ApiResponse<{ order: BackendOrder }>>(
      `/orders/${id}/status`,
      { status: toBackendStatus(payload.status), note: payload.rejectionReason }
    );
    return mapOrder(data.data.order);
  },

  async assignDelivery(id: string, payload: AssignDeliveryPayload): Promise<Order> {
    const { data } = await apiClient.patch<ApiResponse<{ order: BackendOrder }>>(
      `/orders/${id}/assign-delivery`,
      { deliveryPartnerId: payload.deliveryPartnerId }
    );
    return mapOrder(data.data.order);
  },

  async getAvailableDeliveryPartners(): Promise<DeliveryPartner[]> {
    try {
      const { data } = await apiClient.get<
        ApiResponse<Array<{ _id?: string; user?: { name?: string; phone?: string }; vehicleNumber?: string }>>
      >('/delivery/partners/available', { params: { isOnline: true } });
      return (data.data ?? []).map((partner) => ({
        id: String(partner._id ?? ''),
        name: String(partner.user?.name ?? ''),
        phone: String(partner.user?.phone ?? ''),
        vehicleNumber: partner.vehicleNumber,
      }));
    } catch {
      return [];
    }
  },
};
