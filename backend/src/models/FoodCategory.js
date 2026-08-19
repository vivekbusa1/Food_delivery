const mongoose = require('mongoose');

const { Schema } = mongoose;

const foodCategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true, trim: true },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', default: null },
    image: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    description: { type: String, default: '' },
    isGlobal: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

foodCategorySchema.index({ restaurant: 1 });
foodCategorySchema.index({ name: 1, restaurant: 1 }, { unique: true });
foodCategorySchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('FoodCategory', foodCategorySchema);
