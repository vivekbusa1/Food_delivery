const mongoose = require('mongoose');

const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', default: null },
    food: { type: Schema.Types.ObjectId, ref: 'Food', default: null },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '', maxlength: 1000 },
    images: [
      {
        url: { type: String },
        publicId: { type: String },
      },
    ],
    reply: {
      text: { type: String, default: '' },
      repliedAt: { type: Date, default: null },
      repliedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true },
);

reviewSchema.index({ restaurant: 1 });
reviewSchema.index({ food: 1 });
reviewSchema.index({ order: 1, user: 1 }, { unique: true });
reviewSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
