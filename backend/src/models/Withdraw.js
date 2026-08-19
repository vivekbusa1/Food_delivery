const mongoose = require('mongoose');

const { Schema } = mongoose;

const withdrawSchema = new Schema(
  {
    deliveryPartner: { type: Schema.Types.ObjectId, ref: 'DeliveryPartner', required: true },
    amount: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'paid'],
      default: 'pending',
    },
    bankDetails: {
      accountHolderName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      bankName: { type: String, default: '' },
      upiId: { type: String, default: '' },
    },
    processedAt: { type: Date, default: null },
    processedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    rejectionReason: { type: String, default: '' },
    transactionRef: { type: String, default: '' },
  },
  { timestamps: true },
);

withdrawSchema.index({ deliveryPartner: 1, createdAt: -1 });
withdrawSchema.index({ status: 1 });

module.exports = mongoose.model('Withdraw', withdrawSchema);
