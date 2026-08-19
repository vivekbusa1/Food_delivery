const mongoose = require('mongoose');
const { ORDER_STATUS, PAYMENT_METHODS, PAYMENT_STATUS } = require('../constants/orderStatus');

const { Schema } = mongoose;

const statusHistorySchema = new Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: '' },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    items: [{ type: Schema.Types.ObjectId, ref: 'OrderItem' }],
    deliveryAddress: {
      contactName: { type: String, default: '' },
      contactPhone: { type: String, default: '' },
      addressLine1: { type: String, default: '' },
      addressLine2: { type: String, default: '' },
      landmark: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] },
      },
    },
    coupon: { type: Schema.Types.ObjectId, ref: 'Coupon', default: null },
    subTotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    deliveryFee: { type: Number, default: 0, min: 0 },
    packagingCharge: { type: Number, default: 0, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    tipAmount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHODS),
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    payment: { type: Schema.Types.ObjectId, ref: 'Payment', default: null },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
    },
    statusHistory: [statusHistorySchema],
    deliveryPartner: { type: Schema.Types.ObjectId, ref: 'DeliveryPartner', default: null },
    estimatedDeliveryTime: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    cancellationReason: { type: String, default: '' },
    cancelledBy: {
      type: String,
      enum: ['customer', 'restaurant', 'admin', 'delivery', null],
      default: null,
    },
    specialInstructions: { type: String, default: '' },
    isReviewed: { type: Boolean, default: false },
    reorderedFrom: { type: Schema.Types.ObjectId, ref: 'Order', default: null },
  },
  { timestamps: true },
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ restaurant: 1, createdAt: -1 });
orderSchema.index({ deliveryPartner: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
