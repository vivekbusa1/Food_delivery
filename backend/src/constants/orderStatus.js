const ORDER_STATUS = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY_FOR_PICKUP: 'ready_for_pickup',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
});

const ORDER_STATUS_FLOW = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.READY_FOR_PICKUP,
  ORDER_STATUS.OUT_FOR_DELIVERY,
  ORDER_STATUS.DELIVERED,
];

const PAYMENT_METHODS = Object.freeze({
  COD: 'cod',
  RAZORPAY: 'razorpay',
  STRIPE: 'stripe',
  WALLET: 'wallet',
});

const PAYMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
});

module.exports = {
  ORDER_STATUS,
  ORDER_STATUS_FLOW,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
};
