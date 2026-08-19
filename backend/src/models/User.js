const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ALL_ROLES, ROLES } = require('../constants/roles');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ALL_ROLES,
      default: ROLES.CUSTOMER,
    },
    avatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', null],
      default: null,
    },
    dob: { type: Date },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },
    fcmTokens: [{ type: String }],
    otp: {
      code: { type: String, select: false },
      expiresAt: { type: Date, select: false },
      purpose: { type: String, select: false },
    },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    refreshTokens: [{ type: String, select: false }],
    lastLoginAt: { type: Date },
    walletBalance: { type: Number, default: 0, min: 0 },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', default: null },
    deliveryPartner: { type: Schema.Types.ObjectId, ref: 'DeliveryPartner', default: null },
  },
  { timestamps: true },
);

userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.refreshTokens;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
