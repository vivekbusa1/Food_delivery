const mongoose = require('mongoose');

const { Schema } = mongoose;

const walletTransactionSchema = new Schema(
  {
    type: { type: String, enum: ['credit', 'debit'], required: true },
    amount: { type: Number, required: true, min: 0 },
    balanceAfter: { type: Number, required: true },
    reason: { type: String, required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const walletSchema = new Schema(
  {
    ownerType: {
      type: String,
      enum: ['user', 'delivery_partner'],
      default: 'user',
    },
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    deliveryPartner: { type: Schema.Types.ObjectId, ref: 'DeliveryPartner', default: null },
    balance: { type: Number, default: 0, min: 0 },
    transactions: [walletTransactionSchema],
  },
  { timestamps: true },
);

// partialFilterExpression (not sparse): sparse still indexes explicit `null`,
// which collides when many customer wallets have deliveryPartner: null.
walletSchema.index(
  { user: 1 },
  {
    unique: true,
    partialFilterExpression: { user: { $type: 'objectId' } },
  },
);
walletSchema.index(
  { deliveryPartner: 1 },
  {
    unique: true,
    partialFilterExpression: { deliveryPartner: { $type: 'objectId' } },
  },
);

module.exports = mongoose.model('Wallet', walletSchema);
