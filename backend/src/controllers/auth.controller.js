const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { sendSuccess, sendCreated } = require('../helpers/response');
const messages = require('../constants/messages');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const authService = require('../services/auth.service');
const emailService = require('../services/email.service');
const { generateRandomToken } = require('../helpers/token');
const { verifyRefreshToken } = require('../config/jwt');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
};

const setRefreshCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

const register = catchAsync(async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  const existing = await User.findOne({
    $or: [email ? { email } : null, phone ? { phone } : null].filter(Boolean),
  });

  if (existing) {
    throw ApiError.conflict(messages.ERROR.USER_EXISTS);
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: ['customer', 'restaurant', 'delivery'].includes(role) ? role : 'customer',
    referralCode: generateRandomToken(4).toUpperCase(),
  });

  await Wallet.create({ ownerType: 'user', user: user._id, balance: 0 });

  const { accessToken, refreshToken } = await authService.generateAuthTokens(user);
  setRefreshCookie(res, refreshToken);

  if (email) {
    emailService.sendWelcomeEmail(email, name).catch(() => {});
  }

  return sendCreated(res, messages.SUCCESS.REGISTER, {
    user: user.toSafeObject(),
    accessToken,
    refreshToken,
  });
});

const login = catchAsync(async (req, res) => {
  const { email, phone, password } = req.body;

  const user = await User.findOne({
    $or: [email ? { email } : null, phone ? { phone } : null].filter(Boolean),
  }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized(messages.ERROR.INVALID_CREDENTIALS);
  }

  if (!user.isActive || user.isBlocked) {
    throw ApiError.forbidden(messages.ERROR.ACCOUNT_INACTIVE);
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const { accessToken, refreshToken } = await authService.generateAuthTokens(user);
  setRefreshCookie(res, refreshToken);

  return sendSuccess(res, messages.SUCCESS.LOGIN, {
    user: user.toSafeObject(),
    accessToken,
    refreshToken,
  });
});

const logout = catchAsync(async (req, res) => {
  const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

  if (refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      await authService.revokeRefreshToken(decoded.id, refreshToken);
    } catch (err) {
      // Token already invalid/expired — still clear cookie and succeed.
    }
  } else if (req.user) {
    // No refresh token provided; nothing to revoke beyond clearing cookie.
  }

  res.clearCookie('refreshToken', cookieOptions);
  return sendSuccess(res, messages.SUCCESS.LOGOUT);
});

const refresh = catchAsync(async (req, res) => {
  const token = req.body.refreshToken || req.cookies?.refreshToken;

  if (!token) {
    throw ApiError.unauthorized(messages.ERROR.TOKEN_MISSING);
  }

  const { user, tokens } = await authService.rotateRefreshToken(token);
  setRefreshCookie(res, tokens.refreshToken);

  return sendSuccess(res, messages.SUCCESS.TOKEN_REFRESHED, {
    user: user.toSafeObject(),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
});

const sendOtp = catchAsync(async (req, res) => {
  const { email, phone, purpose = 'verification' } = req.body;

  let user = await User.findOne({
    $or: [email ? { email } : null, phone ? { phone } : null].filter(Boolean),
  });

  if (!user && purpose === 'verification') {
    user = await User.create({
      name: email ? email.split('@')[0] : `user_${Date.now()}`,
      email,
      phone,
    });
  }

  if (!user) {
    throw ApiError.notFound(messages.ERROR.NOT_FOUND);
  }

  const otp = await authService.setOtp(user, purpose);

  if (email) {
    // Never block OTP issuance on SMTP failures in local/dev.
    await emailService.sendOtpEmail(email, otp, purpose);
  }

  return sendSuccess(res, messages.SUCCESS.OTP_SENT, {
    userId: user._id,
    ...(process.env.NODE_ENV !== 'production' ? { otp } : {}),
  });
});

const verifyOtpHandler = catchAsync(async (req, res) => {
  const { email, phone, otp, purpose = 'verification' } = req.body;

  const user = await User.findOne({
    $or: [email ? { email } : null, phone ? { phone } : null].filter(Boolean),
  });

  if (!user) {
    throw ApiError.notFound(messages.ERROR.NOT_FOUND);
  }

  await authService.verifyOtp(user, otp, purpose);

  if (purpose === 'verification') {
    if (email) user.isEmailVerified = true;
    if (phone) user.isPhoneVerified = true;
    await user.save({ validateBeforeSave: false });
  }

  const { accessToken, refreshToken } = await authService.generateAuthTokens(user);
  setRefreshCookie(res, refreshToken);

  return sendSuccess(res, messages.SUCCESS.OTP_VERIFIED, {
    user: user.toSafeObject(),
    accessToken,
    refreshToken,
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return sendSuccess(res, 'If this email is registered, a reset link has been sent');
  }

  const resetToken = await authService.createPasswordResetToken(user);
  await emailService.sendPasswordResetEmail(email, resetToken);

  return sendSuccess(res, 'If this email is registered, a reset link has been sent', {
    ...(process.env.NODE_ENV !== 'production' ? { resetToken } : {}),
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const { token, password } = req.body;

  const user = await authService.consumePasswordResetToken(token);

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokens = [];
  await user.save();

  return sendSuccess(res, messages.SUCCESS.PASSWORD_RESET);
});

const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    throw ApiError.badRequest('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  return sendSuccess(res, messages.SUCCESS.PASSWORD_CHANGED);
});

const me = catchAsync(async (req, res) => {
  return sendSuccess(res, messages.SUCCESS.FETCHED, { user: req.user.toSafeObject() });
});

module.exports = {
  register,
  login,
  logout,
  refresh,
  sendOtp,
  verifyOtp: verifyOtpHandler,
  forgotPassword,
  resetPassword,
  changePassword,
  me,
};
