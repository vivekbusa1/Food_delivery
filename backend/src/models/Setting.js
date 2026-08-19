const mongoose = require('mongoose');

const { Schema } = mongoose;

const settingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
    group: {
      type: String,
      enum: ['general', 'payment', 'delivery', 'notification', 'commission', 'seo', 'other'],
      default: 'general',
    },
    description: { type: String, default: '' },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true },
);

settingSchema.index({ group: 1 });

module.exports = mongoose.model('Setting', settingSchema);
