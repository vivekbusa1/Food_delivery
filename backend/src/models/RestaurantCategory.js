const mongoose = require('mongoose');

const { Schema } = mongoose;

const restaurantCategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, lowercase: true, trim: true, unique: true },
    image: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

restaurantCategorySchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('RestaurantCategory', restaurantCategorySchema);
