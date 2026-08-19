const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { sendSuccess, sendCreated } = require('../helpers/response');
const messages = require('../constants/messages');
const { paginate } = require('../helpers/pagination');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Address = require('../models/Address');
const Restaurant = require('../models/Restaurant');
const DeliveryPartner = require('../models/DeliveryPartner');
const Wallet = require('../models/Wallet');
const orderService = require('../services/order.service');
const notificationService = require('../services/notification.service');
const emailService = require('../services/email.service');
const { ROLES } = require('../constants/roles');
const { ORDER_STATUS, ORDER_STATUS_FLOW, PAYMENT_METHODS, PAYMENT_STATUS } = require('../constants/orderStatus');

const createOrder = catchAsync(async (req, res) => {
  const { addressId, deliveryAddress, paymentMethod, specialInstructions, tipAmount } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || !cart.items.length) {
    throw ApiError.badRequest('Cart is empty');
  }

  let resolvedAddress = deliveryAddress;
  if (!resolvedAddress && addressId) {
    const address = await Address.findOne({ _id: addressId, user: req.user._id });
    if (!address) throw ApiError.notFound('Address not found');
    resolvedAddress = {
      contactName: address.contactName || req.user.name,
      contactPhone: address.contactPhone || req.user.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      landmark: address.landmark,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      location: address.location,
    };
  }

  if (!resolvedAddress) {
    throw ApiError.badRequest('Delivery address is required');
  }

  if (paymentMethod === PAYMENT_METHODS.WALLET) {
    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet || wallet.balance < cart.total) {
      throw ApiError.badRequest('Insufficient wallet balance');
    }
  }

  const order = await orderService.createOrderFromCart({
    user: req.user,
    cart,
    deliveryAddress: resolvedAddress,
    paymentMethod,
    specialInstructions,
    tipAmount,
  });

  if (paymentMethod === PAYMENT_METHODS.WALLET) {
    const wallet = await Wallet.findOne({ user: req.user._id });
    wallet.balance -= order.total;
    wallet.transactions.push({
      type: 'debit',
      amount: order.total,
      balanceAfter: wallet.balance,
      reason: `Payment for order ${order.orderNumber}`,
      order: order._id,
    });
    await wallet.save();
    order.paymentStatus = PAYMENT_STATUS.PAID;
    await order.save();
  } else if (paymentMethod === PAYMENT_METHODS.COD) {
    order.status = ORDER_STATUS.CONFIRMED;
    order.statusHistory.push({ status: ORDER_STATUS.CONFIRMED, changedBy: req.user._id });
    await order.save();
  }

  const restaurant = await Restaurant.findById(order.restaurant);
  await notificationService.notifyNewOrder(order, restaurant.owner);
  await notificationService.notifyOrderStatusChange(order);

  if (req.user.email) {
    emailService.sendOrderConfirmationEmail(req.user.email, order).catch(() => {});
  }

  return sendCreated(res, messages.SUCCESS.CREATED, { order });
});

const getMyOrders = catchAsync(async (req, res) => {
  const filter = { user: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const { data, meta } = await paginate(Order, filter, {
    ...req.query,
    populate: [
      { path: 'restaurant', select: 'name logo' },
      { path: 'items' },
    ],
  });

  return sendSuccess(res, messages.SUCCESS.FETCHED, data, meta);
});

const getRestaurantOrders = catchAsync(async (req, res) => {
  const restaurant = await Restaurant.findOne({
    _id: req.params.restaurantId,
    ...(req.user.role !== ROLES.ADMIN ? { owner: req.user._id } : {}),
  });
  if (!restaurant) throw ApiError.notFound('Restaurant not found');

  const filter = { restaurant: restaurant._id };
  if (req.query.status) filter.status = req.query.status;

  const { data, meta } = await paginate(Order, filter, {
    ...req.query,
    populate: [{ path: 'items' }, { path: 'user', select: 'name phone email' }],
  });

  return sendSuccess(res, messages.SUCCESS.FETCHED, data, meta);
});

const getOrderById = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('items')
    .populate('restaurant')
    .populate('user', 'name phone email')
    .populate('deliveryPartner')
    .populate('coupon');

  if (!order) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  const isOwner = order.user._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === ROLES.ADMIN;
  const isRestaurantOwner =
    req.user.role === ROLES.RESTAURANT && order.restaurant.owner?.toString() === req.user._id.toString();
  const isDeliveryPartner =
    order.deliveryPartner && order.deliveryPartner.user?.toString() === req.user._id.toString();

  if (!isOwner && !isAdmin && !isRestaurantOwner && !isDeliveryPartner) {
    throw ApiError.forbidden(messages.ERROR.FORBIDDEN);
  }

  return sendSuccess(res, messages.SUCCESS.FETCHED, { order });
});

const trackOrder = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .select('orderNumber status statusHistory estimatedDeliveryTime deliveryPartner')
    .populate({
      path: 'deliveryPartner',
      select: 'currentLocation user',
      populate: { path: 'user', select: 'name phone' },
    });

  if (!order) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  return sendSuccess(res, messages.SUCCESS.FETCHED, { order });
});

const updateOrderStatus = catchAsync(async (req, res) => {
  const { status, note } = req.body;

  const order = await Order.findById(req.params.id).populate('restaurant');
  if (!order) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  const isAdmin = req.user.role === ROLES.ADMIN;
  const isRestaurantOwner =
    req.user.role === ROLES.RESTAURANT && order.restaurant.owner.toString() === req.user._id.toString();

  if (!isAdmin && !isRestaurantOwner) {
    throw ApiError.forbidden(messages.ERROR.FORBIDDEN);
  }

  if ([ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED, ORDER_STATUS.REJECTED].includes(order.status)) {
    throw ApiError.badRequest('This order has already been finalized and cannot be updated');
  }

  order.status = status;
  order.statusHistory.push({ status, note, changedBy: req.user._id });

  if (status === ORDER_STATUS.DELIVERED) {
    order.deliveredAt = new Date();
    if (order.paymentMethod === PAYMENT_METHODS.COD) {
      order.paymentStatus = PAYMENT_STATUS.PAID;
    }
  }

  await order.save();
  await notificationService.notifyOrderStatusChange(order);

  return sendSuccess(res, messages.SUCCESS.UPDATED, { order });
});

const cancelOrder = catchAsync(async (req, res) => {
  const { reason } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  const isOwner = order.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === ROLES.ADMIN;

  if (!isOwner && !isAdmin) {
    throw ApiError.forbidden(messages.ERROR.FORBIDDEN);
  }

  if (![ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED].includes(order.status)) {
    throw ApiError.badRequest('Order cannot be cancelled at this stage');
  }

  order.status = ORDER_STATUS.CANCELLED;
  order.cancelledAt = new Date();
  order.cancellationReason = reason || '';
  order.cancelledBy = isAdmin ? 'admin' : 'customer';
  order.statusHistory.push({ status: ORDER_STATUS.CANCELLED, note: reason, changedBy: req.user._id });

  if (order.paymentStatus === PAYMENT_STATUS.PAID && order.paymentMethod === PAYMENT_METHODS.WALLET) {
    const wallet = await Wallet.findOne({ user: order.user });
    if (wallet) {
      wallet.balance += order.total;
      wallet.transactions.push({
        type: 'credit',
        amount: order.total,
        balanceAfter: wallet.balance,
        reason: `Refund for cancelled order ${order.orderNumber}`,
        order: order._id,
      });
      await wallet.save();
      order.paymentStatus = PAYMENT_STATUS.REFUNDED;
    }
  }

  await order.save();
  await notificationService.notifyOrderStatusChange(order);

  return sendSuccess(res, messages.SUCCESS.UPDATED, { order });
});

const reorder = catchAsync(async (req, res) => {
  const previousOrder = await Order.findOne({ _id: req.params.id, user: req.user._id }).populate('items');
  if (!previousOrder) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  cart.items = [];
  cart.restaurant = previousOrder.restaurant;

  previousOrder.items.forEach((item) => {
    cart.items.push({
      food: item.food,
      variant: item.variant?.variantId || null,
      addons: (item.addons || []).map((a) => a.addonId),
      quantity: item.quantity,
      price: item.price,
      totalPrice: item.totalPrice,
      specialInstructions: item.specialInstructions,
    });
  });

  await orderService.recalculateCart(cart);
  await cart.save();

  return sendSuccess(res, 'Items added to cart from previous order', { cart });
});

const assignDeliveryPartner = catchAsync(async (req, res) => {
  const { deliveryPartnerId } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  const partner = await DeliveryPartner.findById(deliveryPartnerId);
  if (!partner || !partner.isApproved) throw ApiError.badRequest('Invalid delivery partner');

  order.deliveryPartner = partner._id;
  await order.save();

  partner.activeOrder = order._id;
  partner.isAvailable = false;
  await partner.save();

  await notificationService.notifyDeliveryPartnerAssigned(order, partner.user, partner._id);

  return sendSuccess(res, messages.SUCCESS.UPDATED, { order });
});

const getOrderStatusFlow = catchAsync(async (req, res) => {
  return sendSuccess(res, messages.SUCCESS.FETCHED, { statusFlow: ORDER_STATUS_FLOW });
});

module.exports = {
  createOrder,
  getMyOrders,
  getRestaurantOrders,
  getOrderById,
  trackOrder,
  updateOrderStatus,
  cancelOrder,
  reorder,
  assignDeliveryPartner,
  getOrderStatusFlow,
};
