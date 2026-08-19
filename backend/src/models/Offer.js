const mongoose = require('mongoose');

const { Schema } = mongoose;

const offerSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    image: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', default: null },
    food: { type: Schema.Types.ObjectId, ref: 'Food', default: null },
    discountType: {
      type: String,
      enum: ['percentage', 'flat'],
      default: 'percentage',
    },
    discountValue: { type: Number, required: true, min: 0 },
    maxDiscountAmount: { type: Number, default: null },
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

offerSchema.index({ isActive: 1, validUntil: 1 });
offerSchema.index({ restaurant: 1 });
offerSchema.index({ food: 1 });

module.exports = mongoose.model('Offer', offerSchema);
