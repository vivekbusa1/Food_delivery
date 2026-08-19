const mongoose = require('mongoose');

const { Schema } = mongoose;

const foodSchema = new Schema(
  {
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    category: { type: Schema.Types.ObjectId, ref: 'FoodCategory', required: true },
    name: { type: String, required: true, trim: true, maxlength: 150 },
    slug: { type: String, lowercase: true, trim: true },
    description: { type: String, default: '', maxlength: 2000 },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: '' },
      },
    ],
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: null, min: 0 },
    isVeg: { type: Boolean, default: true },
    spiceLevel: {
      type: String,
      enum: ['none', 'mild', 'medium', 'hot', 'extra_hot'],
      default: 'none',
    },
    tags: [{ type: String, trim: true }],
    ingredients: [{ type: String, trim: true }],
    allergens: [{ type: String, trim: true }],
    calories: { type: Number, default: null },
    isAvailable: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    preparationTime: { type: Number, default: 15 },
    ratingsAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingsCount: { type: Number, default: 0, min: 0 },
    totalOrders: { type: Number, default: 0, min: 0 },
    variants: [{ type: Schema.Types.ObjectId, ref: 'FoodVariant' }],
    addons: [{ type: Schema.Types.ObjectId, ref: 'Addon' }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

foodSchema.index({ restaurant: 1 });
foodSchema.index({ category: 1 });
foodSchema.index({ name: 'text', description: 'text', tags: 'text' });
foodSchema.index({ isAvailable: 1, isActive: 1 });
foodSchema.index({ price: 1 });
foodSchema.index({ ratingsAverage: -1 });
foodSchema.index({ createdAt: -1 });

foodSchema.virtual('effectivePrice').get(function effectivePrice() {
  return this.discountPrice && this.discountPrice < this.price ? this.discountPrice : this.price;
});

foodSchema.set('toJSON', { virtuals: true });
foodSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Food', foodSchema);
