const mongoose = require('mongoose');

const { Schema } = mongoose;

const deliveryPartnerSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    vehicleType: {
      type: String,
      enum: ['bike', 'scooter', 'bicycle', 'car'],
      default: 'bike',
    },
    vehicleNumber: { type: String, default: '' },
    licenseNumber: { type: String, default: '' },
    documents: [
      {
        name: String,
        url: String,
        publicId: String,
      },
    ],
    isAvailable: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    currentLocation: {
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
    activeOrder: { type: Schema.Types.ObjectId, ref: 'Order', default: null },
    ratingsAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingsCount: { type: Number, default: 0 },
    totalDeliveries: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

deliveryPartnerSchema.index({ currentLocation: '2dsphere' });
deliveryPartnerSchema.index({ isAvailable: 1, isOnline: 1, isApproved: 1 });

module.exports = mongoose.model('DeliveryPartner', deliveryPartnerSchema);
