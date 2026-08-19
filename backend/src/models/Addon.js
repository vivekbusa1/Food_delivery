const mongoose = require('mongoose');

const { Schema } = mongoose;

const addonSchema = new Schema(
  {
    food: { type: Schema.Types.ObjectId, ref: 'Food', required: true },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    isMultipleAllowed: { type: Boolean, default: false },
    maxQuantity: { type: Number, default: 1, min: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

addonSchema.index({ food: 1 });
addonSchema.index({ restaurant: 1 });

module.exports = mongoose.model('Addon', addonSchema);
