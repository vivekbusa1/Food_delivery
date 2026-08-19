export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItemAddOn {
  name: string;
  price: number;
}

export interface OrderItem {
  foodId: string;
  name: string;
  quantity: number;
  price: number;
  variant?: string;
  addOns?: OrderItemAddOn[];
  imageUrl?: string;
}

export interface OrderCustomer {
  id: string;
  name: string;
  phone: string;
}

export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  vehicleNumber?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  deliveryAddress: string;
  deliveryPartner?: DeliveryPartner | null;
  specialInstructions?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  estimatedDeliveryTime?: string;
}

export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: OrderStatus | 'all';
  search?: string;
  from?: string;
  to?: string;
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
  rejectionReason?: string;
  preparationTimeMinutes?: number;
}

export interface AssignDeliveryPayload {
  deliveryPartnerId?: string;
  name?: string;
  phone?: string;
  vehicleNumber?: string;
}
