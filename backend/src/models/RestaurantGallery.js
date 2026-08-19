const mongoose = require('mongoose');

const { Schema } = mongoose;

const restaurantGallerySchema = new Schema(
  {
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    image: {
      url: { type: String, required: true },
      publicId: { type: String, default: '' },
    },
    caption: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

restaurantGallerySchema.index({ restaurant: 1 });

module.exports = mongoose.model('RestaurantGallery', restaurantGallerySchema);
