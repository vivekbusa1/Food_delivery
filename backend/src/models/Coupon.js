const mongoose = require('mongoose');

const { Schema } = mongoose;

const couponSchema = new Schema(
  {
    code: { type: String, required: true, uppercase: true, trim: true, unique: true },
    description: { type: String, default: '' },
    discountType: {
      type: String,
      enum: ['percentage', 'flat'],
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },
    maxDiscountAmount: { type: Number, default: null },
    minOrderAmount: { type: Number, default: 0 },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', default: null },
    applicableTo: {
      type: String,
      enum: ['all', 'restaurant', 'new_user'],
      default: 'all',
    },
    usageLimit: { type: Number, default: null },
    usageLimitPerUser: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },
    usedBy: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        count: { type: Number, default: 1 },
      },
    ],
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

couponSchema.index({ isActive: 1, validUntil: 1 });
couponSchema.index({ restaurant: 1 });

module.exports = mongoose.model('Coupon', couponSchema);
