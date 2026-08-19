const mongoose = require('mongoose');

const { Schema } = mongoose;

const restaurantTimingSchema = new Schema(
  {
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true,
    },
    isOpen: { type: Boolean, default: true },
    openTime: { type: String, default: '09:00' },
    closeTime: { type: String, default: '23:00' },
  },
  { timestamps: true },
);

restaurantTimingSchema.index({ restaurant: 1, day: 1 }, { unique: true });

module.exports = mongoose.model('RestaurantTiming', restaurantTimingSchema);
