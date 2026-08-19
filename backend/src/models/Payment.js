const mongoose = require('mongoose');
const { PAYMENT_METHODS, PAYMENT_STATUS } = require('../constants/orderStatus');

const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    method: {
      type: String,
      enum: Object.values(PAYMENT_METHODS),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    provider: {
      type: String,
      enum: ['razorpay', 'stripe', 'cod', 'wallet', null],
      default: null,
    },
    providerOrderId: { type: String, default: null },
    providerPaymentId: { type: String, default: null },
    providerSignature: { type: String, default: null },
    refundId: { type: String, default: null },
    refundAmount: { type: Number, default: 0 },
    refundReason: { type: String, default: '' },
    failureReason: { type: String, default: '' },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ providerOrderId: 1 });
paymentSchema.index({ providerPaymentId: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
