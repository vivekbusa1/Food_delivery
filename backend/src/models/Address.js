const mongoose = require('mongoose');

const { Schema } = mongoose;

const addressSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    label: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home',
    },
    contactName: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, default: '' },
    landmark: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'India' },
    zipCode: { type: String, required: true },
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
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

addressSchema.index({ user: 1 });
addressSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Address', addressSchema);
