const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../helpers/response');
const messages = require('../constants/messages');
const { paginate } = require('../helpers/pagination');
const Notification = require('../models/Notification');
const notificationService = require('../services/notification.service');

const listNotifications = catchAsync(async (req, res) => {
  const filter = {
    $or: [{ user: req.user._id }, { role: req.user.role }, { role: 'all' }],
  };
  if (req.query.isRead !== undefined) filter.isRead = req.query.isRead === 'true';

  const { data, meta } = await paginate(Notification, filter, req.query);
  return sendSuccess(res, messages.SUCCESS.FETCHED, data, meta);
});

const getUnreadCount = catchAsync(async (req, res) => {
  const count = await Notification.countDocuments({
    $or: [{ user: req.user._id }, { role: req.user.role }, { role: 'all' }],
    isRead: false,
  });

  return sendSuccess(res, messages.SUCCESS.FETCHED, { count });
});

const markAsRead = catchAsync(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  return sendSuccess(res, messages.SUCCESS.UPDATED, { notification });
});

const markAllAsRead = catchAsync(async (req, res) => {
  await Notification.updateMany(
    { $or: [{ user: req.user._id }, { role: req.user.role }, { role: 'all' }], isRead: false },
    { isRead: true, readAt: new Date() },
  );

  return sendSuccess(res, messages.SUCCESS.UPDATED);
});

const deleteNotification = catchAsync(async (req, res) => {
  const notification = await Notification.findByIdAndDelete(req.params.id);
  if (!notification) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  return sendSuccess(res, messages.SUCCESS.DELETED);
});

const sendBroadcast = catchAsync(async (req, res) => {
  const { title, message, role, type } = req.body;

  const notification = await notificationService.createNotification({
    role: role || 'all',
    title,
    message,
    type: type || 'promotion',
  });

  return sendSuccess(res, 'Broadcast notification sent', { notification });
});

module.exports = {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendBroadcast,
};
