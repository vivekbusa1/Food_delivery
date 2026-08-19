const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../helpers/response');
const messages = require('../constants/messages');
const { paginate } = require('../helpers/pagination');
const User = require('../models/User');
const uploadService = require('../services/upload.service');

const getProfile = catchAsync(async (req, res) => {
  return sendSuccess(res, messages.SUCCESS.FETCHED, { user: req.user.toSafeObject() });
});

const updateProfile = catchAsync(async (req, res) => {
  const allowedFields = ['name', 'gender', 'dob'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  return sendSuccess(res, messages.SUCCESS.UPDATED, { user: user.toSafeObject() });
});

const updateAvatar = catchAsync(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('Avatar image is required');
  }

  const user = await User.findById(req.user._id);

  if (user.avatar && user.avatar.publicId) {
    await uploadService.deleteFromCloudinary(user.avatar.publicId);
  }

  const uploaded = uploadService.mapUploadedFile(req.file);
  user.avatar = uploaded;
  await user.save({ validateBeforeSave: false });

  return sendSuccess(res, messages.SUCCESS.UPDATED, { user: user.toSafeObject() });
});

const deleteAccount = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.isActive = false;
  user.refreshTokens = [];
  await user.save({ validateBeforeSave: false });

  return sendSuccess(res, 'Account deactivated successfully');
});

const registerFcmToken = catchAsync(async (req, res) => {
  const { token } = req.body;
  if (!token) throw ApiError.badRequest('FCM token is required');

  await User.updateOne({ _id: req.user._id }, { $addToSet: { fcmTokens: token } });
  return sendSuccess(res, messages.SUCCESS.UPDATED);
});

const listUsers = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
      { phone: { $regex: req.query.search, $options: 'i' } },
    ];
  }
  if (req.query.isBlocked !== undefined) filter.isBlocked = req.query.isBlocked === 'true';

  const { data, meta } = await paginate(User, filter, req.query);
  return sendSuccess(res, messages.SUCCESS.FETCHED, data, meta);
});

const getUserById = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound(messages.ERROR.NOT_FOUND);
  return sendSuccess(res, messages.SUCCESS.FETCHED, { user: user.toSafeObject() });
});

const updateUserStatus = catchAsync(async (req, res) => {
  const { isBlocked, isActive } = req.body;
  const updates = {};
  if (isBlocked !== undefined) updates.isBlocked = isBlocked;
  if (isActive !== undefined) updates.isActive = isActive;

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!user) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  return sendSuccess(res, messages.SUCCESS.UPDATED, { user: user.toSafeObject() });
});

const deleteUser = catchAsync(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw ApiError.notFound(messages.ERROR.NOT_FOUND);
  return sendSuccess(res, messages.SUCCESS.DELETED);
});

module.exports = {
  getProfile,
  updateProfile,
  updateAvatar,
  deleteAccount,
  registerFcmToken,
  listUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
};
