const mongoose = require('mongoose');

const { Schema } = mongoose;

const orderItemSchema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    food: { type: Schema.Types.ObjectId, ref: 'Food', required: true },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    variant: {
      variantId: { type: Schema.Types.ObjectId, ref: 'FoodVariant', default: null },
      name: { type: String, default: '' },
      price: { type: Number, default: 0 },
    },
    addons: [
      {
        addonId: { type: Schema.Types.ObjectId, ref: 'Addon' },
        name: { type: String },
        price: { type: Number },
      },
    ],
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    specialInstructions: { type: String, default: '' },
  },
  { timestamps: true },
);

orderItemSchema.index({ order: 1 });
orderItemSchema.index({ food: 1 });

module.exports = mongoose.model('OrderItem', orderItemSchema);
