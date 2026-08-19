const mongoose = require('mongoose');

const { Schema } = mongoose;

const wishlistSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    food: { type: Schema.Types.ObjectId, ref: 'Food', required: true },
  },
  { timestamps: true },
);

wishlistSchema.index({ user: 1, food: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
