const mongoose = require('mongoose');

const { Schema } = mongoose;

const ratingSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    targetType: {
      type: String,
      enum: ['delivery_partner', 'restaurant', 'food'],
      required: true,
    },
    deliveryPartner: { type: Schema.Types.ObjectId, ref: 'DeliveryPartner', default: null },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', default: null },
    food: { type: Schema.Types.ObjectId, ref: 'Food', default: null },
    score: { type: Number, required: true, min: 1, max: 5 },
    feedback: { type: String, default: '' },
  },
  { timestamps: true },
);

ratingSchema.index({ order: 1, targetType: 1, user: 1 }, { unique: true });
ratingSchema.index({ deliveryPartner: 1 });
ratingSchema.index({ restaurant: 1 });

module.exports = mongoose.model('Rating', ratingSchema);
