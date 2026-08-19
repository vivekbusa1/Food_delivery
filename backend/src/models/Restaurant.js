const mongoose = require('mongoose');

const { Schema } = mongoose;

const restaurantSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true, maxlength: 150 },
    slug: { type: String, unique: true, sparse: true, lowercase: true },
    description: { type: String, default: '', maxlength: 2000 },
    logo: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    coverImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    categories: [{ type: Schema.Types.ObjectId, ref: 'RestaurantCategory' }],
    cuisines: [{ type: String, trim: true }],
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: '' },
      zipCode: { type: String, default: '' },
      landmark: { type: String, default: '' },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    deliveryFee: { type: Number, default: 0, min: 0 },
    freeDeliveryAbove: { type: Number, default: null },
    avgDeliveryTime: { type: Number, default: 30 },
    packagingCharge: { type: Number, default: 0, min: 0 },
    taxPercent: { type: Number, default: 0, min: 0, max: 100 },
    commissionPercent: { type: Number, default: 10, min: 0, max: 100 },
    ratingsAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingsCount: { type: Number, default: 0, min: 0 },
    isVeg: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isOpen: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    documents: [
      {
        name: String,
        url: String,
        publicId: String,
      },
    ],
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true },
);

restaurantSchema.index({ location: '2dsphere' });
restaurantSchema.index({ name: 'text', description: 'text', tags: 'text' });
restaurantSchema.index({ owner: 1 });
restaurantSchema.index({ isApproved: 1, isActive: 1, isOpen: 1 });
restaurantSchema.index({ ratingsAverage: -1 });
restaurantSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Restaurant', restaurantSchema);
