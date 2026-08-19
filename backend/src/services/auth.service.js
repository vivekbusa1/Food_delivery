const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../config/jwt');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const messages = require('../constants/messages');
const config = require('../config');
const { generateOTP, generateRandomToken, hashToken } = require('../helpers/token');

const generateAuthTokens = async (user) => {
  const payload = { id: user._id.toString(), role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  user.refreshTokens = user.refreshTokens || [];
  user.refreshTokens.push(refreshToken);
  if (user.refreshTokens.length > 5) {
    user.refreshTokens = user.refreshTokens.slice(-5);
  }
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const rotateRefreshToken = async (oldToken) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(oldToken);
  } catch (err) {
    throw ApiError.unauthorized(messages.ERROR.INVALID_TOKEN);
  }

  const user = await User.findById(decoded.id).select('+refreshTokens');
  if (!user || !user.refreshTokens.includes(oldToken)) {
    throw ApiError.unauthorized(messages.ERROR.INVALID_TOKEN);
  }

  user.refreshTokens = user.refreshTokens.filter((t) => t !== oldToken);
  const tokens = await generateAuthTokens(user);

  return { user, tokens };
};

const revokeRefreshToken = async (userId, refreshToken) => {
  const user = await User.findById(userId).select('+refreshTokens');
  if (!user) return;
  user.refreshTokens = (user.refreshTokens || []).filter((t) => t !== refreshToken);
  await user.save({ validateBeforeSave: false });
};

const setOtp = async (user, purpose = 'verification') => {
  const otp = generateOTP(4);
  const expiresAt = new Date(Date.now() + config.otpExpireMinutes * 60 * 1000);

  user.otp = { code: otp, expiresAt, purpose };
  await user.save({ validateBeforeSave: false });

  return otp;
};

const verifyOtp = async (user, otp, purpose = 'verification') => {
  const userWithOtp = await User.findById(user._id).select('+otp.code +otp.expiresAt +otp.purpose');

  if (
    !userWithOtp.otp ||
    !userWithOtp.otp.code ||
    userWithOtp.otp.code !== otp ||
    userWithOtp.otp.purpose !== purpose ||
    !userWithOtp.otp.expiresAt ||
    userWithOtp.otp.expiresAt < new Date()
  ) {
    throw ApiError.badRequest(messages.ERROR.OTP_INVALID);
  }

  userWithOtp.otp = undefined;
  await userWithOtp.save({ validateBeforeSave: false });

  return userWithOtp;
};

const createPasswordResetToken = async (user) => {
  const resetToken = generateRandomToken(32);
  user.passwordResetToken = hashToken(resetToken);
  user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
  await user.save({ validateBeforeSave: false });
  return resetToken;
};

const consumePasswordResetToken = async (token) => {
  const hashed = hashToken(token);
  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    throw ApiError.badRequest(messages.ERROR.INVALID_TOKEN);
  }

  return user;
};

module.exports = {
  generateAuthTokens,
  rotateRefreshToken,
  revokeRefreshToken,
  setOtp,
  verifyOtp,
  createPasswordResetToken,
  consumePasswordResetToken,
};
