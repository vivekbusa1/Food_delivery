const mongoose = require('mongoose');

const { Schema } = mongoose;

const favoriteRestaurantSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  },
  { timestamps: true },
);

favoriteRestaurantSchema.index({ user: 1, restaurant: 1 }, { unique: true });

module.exports = mongoose.model('FavoriteRestaurant', favoriteRestaurantSchema);
