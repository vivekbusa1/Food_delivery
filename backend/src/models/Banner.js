const mongoose = require('mongoose');

const { Schema } = mongoose;

const bannerSchema = new Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    image: {
      url: { type: String, required: true },
      publicId: { type: String, default: '' },
    },
    linkType: {
      type: String,
      enum: ['restaurant', 'food', 'category', 'offer', 'url', 'none'],
      default: 'none',
    },
    linkId: { type: Schema.Types.ObjectId, default: null },
    linkUrl: { type: String, default: '' },
    position: {
      type: String,
      enum: ['home_top', 'home_middle', 'home_bottom', 'restaurant_page'],
      default: 'home_top',
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null },
  },
  { timestamps: true },
);

bannerSchema.index({ isActive: 1, position: 1, order: 1 });

module.exports = mongoose.model('Banner', bannerSchema);
