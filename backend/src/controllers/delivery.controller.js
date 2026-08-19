const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { sendSuccess, sendCreated } = require('../helpers/response');
const messages = require('../constants/messages');
const { paginate } = require('../helpers/pagination');
const DeliveryPartner = require('../models/DeliveryPartner');
const Order = require('../models/Order');
const Wallet = require('../models/Wallet');
const Withdraw = require('../models/Withdraw');
const User = require('../models/User');
const notificationService = require('../services/notification.service');
const { ROLES } = require('../constants/roles');
const { ORDER_STATUS, PAYMENT_METHODS, PAYMENT_STATUS } = require('../constants/orderStatus');

const registerPartner = catchAsync(async (req, res) => {
  const existing = await DeliveryPartner.findOne({ user: req.user._id });
  if (existing) throw ApiError.conflict('You are already registered as a delivery partner');

  const { vehicleType, vehicleNumber, licenseNumber } = req.body;

  const partner = await DeliveryPartner.create({
    user: req.user._id,
    vehicleType,
    vehicleNumber,
    licenseNumber,
  });

  await User.findByIdAndUpdate(req.user._id, { role: ROLES.DELIVERY, deliveryPartner: partner._id });
  await Wallet.create({ ownerType: 'delivery_partner', deliveryPartner: partner._id, balance: 0 });

  return sendCreated(res, messages.SUCCESS.CREATED, { partner });
});

const getMyPartnerProfile = catchAsync(async (req, res) => {
  const partner = await DeliveryPartner.findOne({ user: req.user._id }).populate('activeOrder');
  if (!partner) throw ApiError.notFound('Delivery partner profile not found');

  return sendSuccess(res, messages.SUCCESS.FETCHED, { partner });
});

const updateAvailability = catchAsync(async (req, res) => {
  const { isOnline, isAvailable } = req.body;

  const partner = await DeliveryPartner.findOne({ user: req.user._id });
  if (!partner) throw ApiError.notFound('Delivery partner profile not found');

  if (isOnline !== undefined) partner.isOnline = isOnline;
  if (isAvailable !== undefined) partner.isAvailable = isAvailable;
  await partner.save();

  return sendSuccess(res, messages.SUCCESS.UPDATED, { partner });
});

const updateLocation = catchAsync(async (req, res) => {
  const { lng, lat } = req.body;

  const partner = await DeliveryPartner.findOneAndUpdate(
    { user: req.user._id },
    { currentLocation: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] } },
    { new: true },
  );
  if (!partner) throw ApiError.notFound('Delivery partner profile not found');

  return sendSuccess(res, messages.SUCCESS.UPDATED, { partner });
});

const nearbyAvailableOrders = catchAsync(async (req, res) => {
  const orders = await Order.find({
    status: ORDER_STATUS.READY_FOR_PICKUP,
    deliveryPartner: null,
  })
    .populate('restaurant', 'name address location')
    .sort({ createdAt: 1 })
    .limit(20);

  return sendSuccess(res, messages.SUCCESS.FETCHED, { orders });
});

const acceptOrder = catchAsync(async (req, res) => {
  const partner = await DeliveryPartner.findOne({ user: req.user._id });
  if (!partner) throw ApiError.notFound('Delivery partner profile not found');
  if (!partner.isApproved) throw ApiError.forbidden('Your account is pending approval');
  if (partner.activeOrder) throw ApiError.badRequest('You already have an active order');

  const order = await Order.findOneAndUpdate(
    { _id: req.params.orderId, deliveryPartner: null },
    { deliveryPartner: partner._id },
    { new: true },
  );

  if (!order) throw ApiError.badRequest('Order is no longer available or already assigned');

  partner.activeOrder = order._id;
  partner.isAvailable = false;
  await partner.save();

  await notificationService.notifyDeliveryPartnerAssigned(order, req.user._id);
  await notificationService.notifyOrderStatusChange(order);

  return sendSuccess(res, messages.SUCCESS.UPDATED, { order });
});

const rejectOrder = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  return sendSuccess(res, 'Order rejected', { orderId: order._id });
});

const updateOrderStatus = catchAsync(async (req, res) => {
  const { status } = req.body;

  const partner = await DeliveryPartner.findOne({ user: req.user._id });
  if (!partner) throw ApiError.notFound('Delivery partner profile not found');

  const order = await Order.findOne({ _id: req.params.orderId, deliveryPartner: partner._id });
  if (!order) throw ApiError.notFound('Order not found or not assigned to you');

  const allowedStatuses = [ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.DELIVERED];
  if (!allowedStatuses.includes(status)) {
    throw ApiError.badRequest('Invalid status update for delivery partner');
  }

  order.status = status;
  order.statusHistory.push({ status, changedBy: req.user._id });

  if (status === ORDER_STATUS.DELIVERED) {
    order.deliveredAt = new Date();
    if (order.paymentMethod === PAYMENT_METHODS.COD) {
      order.paymentStatus = PAYMENT_STATUS.PAID;
    }

    partner.activeOrder = null;
    partner.isAvailable = true;
    partner.totalDeliveries += 1;

    const earning = Math.round(order.deliveryFee * 0.8 * 100) / 100;
    partner.totalEarnings += earning;
    await partner.save();

    const wallet = await Wallet.findOne({ deliveryPartner: partner._id });
    if (wallet) {
      wallet.balance += earning;
      wallet.transactions.push({
        type: 'credit',
        amount: earning,
        balanceAfter: wallet.balance,
        reason: `Delivery earning for order ${order.orderNumber}`,
        order: order._id,
      });
      await wallet.save();
    }
  }

  await order.save();
  await notificationService.notifyOrderStatusChange(order);

  return sendSuccess(res, messages.SUCCESS.UPDATED, { order });
});

const getMyDeliveries = catchAsync(async (req, res) => {
  const partner = await DeliveryPartner.findOne({ user: req.user._id });
  if (!partner) throw ApiError.notFound('Delivery partner profile not found');

  const filter = { deliveryPartner: partner._id };
  if (req.query.status) filter.status = req.query.status;

  const { data, meta } = await paginate(Order, filter, {
    ...req.query,
    populate: [{ path: 'restaurant', select: 'name address' }, { path: 'items' }],
  });

  return sendSuccess(res, messages.SUCCESS.FETCHED, data, meta);
});

const getWallet = catchAsync(async (req, res) => {
  const partner = await DeliveryPartner.findOne({ user: req.user._id });
  if (!partner) throw ApiError.notFound('Delivery partner profile not found');

  const wallet = await Wallet.findOne({ deliveryPartner: partner._id });
  return sendSuccess(res, messages.SUCCESS.FETCHED, { wallet });
});

const requestWithdraw = catchAsync(async (req, res) => {
  const { amount, bankDetails } = req.body;

  const partner = await DeliveryPartner.findOne({ user: req.user._id });
  if (!partner) throw ApiError.notFound('Delivery partner profile not found');

  const wallet = await Wallet.findOne({ deliveryPartner: partner._id });
  if (!wallet || wallet.balance < amount) {
    throw ApiError.badRequest('Insufficient wallet balance');
  }

  const withdraw = await Withdraw.create({
    deliveryPartner: partner._id,
    amount,
    bankDetails,
  });

  wallet.balance -= amount;
  wallet.transactions.push({
    type: 'debit',
    amount,
    balanceAfter: wallet.balance,
    reason: 'Withdrawal request',
  });
  await wallet.save();

  return sendCreated(res, messages.SUCCESS.CREATED, { withdraw });
});

const getMyWithdrawals = catchAsync(async (req, res) => {
  const partner = await DeliveryPartner.findOne({ user: req.user._id });
  if (!partner) throw ApiError.notFound('Delivery partner profile not found');

  const { data, meta } = await paginate(Withdraw, { deliveryPartner: partner._id }, req.query);
  return sendSuccess(res, messages.SUCCESS.FETCHED, data, meta);
});

const listWithdrawals = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const { data, meta } = await paginate(Withdraw, filter, {
    ...req.query,
    populate: { path: 'deliveryPartner', populate: { path: 'user', select: 'name email phone' } },
  });

  return sendSuccess(res, messages.SUCCESS.FETCHED, data, meta);
});

const processWithdraw = catchAsync(async (req, res) => {
  const { status, rejectionReason, transactionRef } = req.body;

  const withdraw = await Withdraw.findById(req.params.id);
  if (!withdraw) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  if (withdraw.status !== 'pending') {
    throw ApiError.badRequest('This withdrawal request has already been processed');
  }

  withdraw.status = status;
  withdraw.processedAt = new Date();
  withdraw.processedBy = req.user._id;

  if (status === 'rejected') {
    withdraw.rejectionReason = rejectionReason || '';

    const wallet = await Wallet.findOne({ deliveryPartner: withdraw.deliveryPartner });
    if (wallet) {
      wallet.balance += withdraw.amount;
      wallet.transactions.push({
        type: 'credit',
        amount: withdraw.amount,
        balanceAfter: wallet.balance,
        reason: 'Withdrawal request rejected - amount refunded',
      });
      await wallet.save();
    }
  } else if (status === 'paid') {
    withdraw.transactionRef = transactionRef || '';
  }

  await withdraw.save();

  return sendSuccess(res, messages.SUCCESS.UPDATED, { withdraw });
});

const listPartners = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.approvalStatus) filter.approvalStatus = req.query.approvalStatus;
  if (req.query.isOnline !== undefined) filter.isOnline = req.query.isOnline === 'true';

  const { data, meta } = await paginate(DeliveryPartner, filter, {
    ...req.query,
    populate: { path: 'user', select: 'name email phone avatar' },
  });

  return sendSuccess(res, messages.SUCCESS.FETCHED, data, meta);
});

const listAvailablePartners = catchAsync(async (req, res) => {
  const filter = {
    approvalStatus: 'approved',
    isApproved: true,
  };
  if (req.query.isOnline !== undefined) {
    filter.isOnline = req.query.isOnline === 'true';
  } else {
    filter.isOnline = true;
  }

  const { data, meta } = await paginate(DeliveryPartner, filter, {
    ...req.query,
    populate: { path: 'user', select: 'name email phone avatar' },
  });

  return sendSuccess(res, messages.SUCCESS.FETCHED, data, meta);
});

const approvePartner = catchAsync(async (req, res) => {
  const { approvalStatus } = req.body;

  const partner = await DeliveryPartner.findById(req.params.id);
  if (!partner) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  partner.approvalStatus = approvalStatus;
  partner.isApproved = approvalStatus === 'approved';
  await partner.save();

  return sendSuccess(res, messages.SUCCESS.UPDATED, { partner });
});

module.exports = {
  registerPartner,
  getMyPartnerProfile,
  updateAvailability,
  updateLocation,
  nearbyAvailableOrders,
  acceptOrder,
  rejectOrder,
  updateOrderStatus,
  getMyDeliveries,
  getWallet,
  requestWithdraw,
  getMyWithdrawals,
  listWithdrawals,
  processWithdraw,
  listPartners,
  listAvailablePartners,
  approvePartner,
};
