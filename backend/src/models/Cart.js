const mongoose = require('mongoose');

const { Schema } = mongoose;

const cartItemSchema = new Schema(
  {
    food: { type: Schema.Types.ObjectId, ref: 'Food', required: true },
    variant: { type: Schema.Types.ObjectId, ref: 'FoodVariant', default: null },
    addons: [{ type: Schema.Types.ObjectId, ref: 'Addon' }],
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    specialInstructions: { type: String, default: '' },
  },
  { _id: true, timestamps: false },
);

const cartSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', default: null },
    items: [cartItemSchema],
    coupon: { type: Schema.Types.ObjectId, ref: 'Coupon', default: null },
    subTotal: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    deliveryFee: { type: Number, default: 0, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Cart', cartSchema);
