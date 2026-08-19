const cron = require('node-cron');
const logger = require('../utils/logger');
const Coupon = require('../models/Coupon');
const Offer = require('../models/Offer');
const Banner = require('../models/Banner');
const Notification = require('../models/Notification');
const Order = require('../models/Order');
const User = require('../models/User');
const { ORDER_STATUS, PAYMENT_METHODS, PAYMENT_STATUS } = require('../constants/orderStatus');

const expireCoupons = async () => {
  const result = await Coupon.updateMany(
    { isActive: true, validUntil: { $lt: new Date() } },
    { isActive: false },
  );
  if (result.modifiedCount) {
    logger.info(`Cron: expired ${result.modifiedCount} coupon(s)`);
  }
};

const expireOffers = async () => {
  const result = await Offer.updateMany(
    { isActive: true, validUntil: { $lt: new Date() } },
    { isActive: false },
  );
  if (result.modifiedCount) {
    logger.info(`Cron: expired ${result.modifiedCount} offer(s)`);
  }
};

const expireBanners = async () => {
  const result = await Banner.updateMany(
    { isActive: true, endDate: { $ne: null, $lt: new Date() } },
    { isActive: false },
  );
  if (result.modifiedCount) {
    logger.info(`Cron: expired ${result.modifiedCount} banner(s)`);
  }
};

const cleanupOldNotifications = async () => {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const result = await Notification.deleteMany({
    isRead: true,
    createdAt: { $lt: ninetyDaysAgo },
  });
  if (result.deletedCount) {
    logger.info(`Cron: cleaned up ${result.deletedCount} old notification(s)`);
  }
};

const autoCancelStalePendingOrders = async () => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  const staleOrders = await Order.find({
    status: ORDER_STATUS.PENDING,
    paymentMethod: { $ne: PAYMENT_METHODS.COD },
    paymentStatus: PAYMENT_STATUS.PENDING,
    createdAt: { $lt: thirtyMinutesAgo },
  });

  for (const order of staleOrders) {
    order.status = ORDER_STATUS.CANCELLED;
    order.cancelledAt = new Date();
    order.cancellationReason = 'Automatically cancelled due to payment timeout';
    order.cancelledBy = 'admin';
    order.statusHistory.push({ status: ORDER_STATUS.CANCELLED, note: 'Auto-cancelled: payment timeout' });
    // eslint-disable-next-line no-await-in-loop
    await order.save();
  }

  if (staleOrders.length) {
    logger.info(`Cron: auto-cancelled ${staleOrders.length} stale unpaid order(s)`);
  }
};

const cleanupExpiredOtps = async () => {
  const result = await User.updateMany(
    { 'otp.expiresAt': { $lt: new Date() } },
    { $unset: { otp: 1 } },
  );
  if (result.modifiedCount) {
    logger.info(`Cron: cleared expired OTPs for ${result.modifiedCount} user(s)`);
  }
};

const runSafely = (name, fn) => async () => {
  try {
    await fn();
  } catch (error) {
    logger.error(`Cron job "${name}" failed: ${error.message}`);
  }
};

const initCronJobs = () => {
  // Every 15 minutes: expire coupons, offers, banners
  cron.schedule('*/15 * * * *', runSafely('expireCoupons', expireCoupons));
  cron.schedule('*/15 * * * *', runSafely('expireOffers', expireOffers));
  cron.schedule('*/15 * * * *', runSafely('expireBanners', expireBanners));

  // Every 10 minutes: auto cancel stale unpaid orders
  cron.schedule('*/10 * * * *', runSafely('autoCancelStalePendingOrders', autoCancelStalePendingOrders));

  // Every hour: cleanup expired OTPs
  cron.schedule('0 * * * *', runSafely('cleanupExpiredOtps', cleanupExpiredOtps));

  // Daily at 3 AM: cleanup old read notifications
  cron.schedule('0 3 * * *', runSafely('cleanupOldNotifications', cleanupOldNotifications));

  logger.info('Cron jobs scheduled');
};

module.exports = {
  initCronJobs,
  expireCoupons,
  expireOffers,
  expireBanners,
  cleanupOldNotifications,
  autoCancelStalePendingOrders,
  cleanupExpiredOtps,
};
