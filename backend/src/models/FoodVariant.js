const mongoose = require('mongoose');

const { Schema } = mongoose;

const foodVariantSchema = new Schema(
  {
    food: { type: Schema.Types.ObjectId, ref: 'Food', required: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

foodVariantSchema.index({ food: 1 });

module.exports = mongoose.model('FoodVariant', foodVariantSchema);
