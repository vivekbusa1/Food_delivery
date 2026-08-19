const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { sendSuccess, sendCreated } = require('../helpers/response');
const messages = require('../constants/messages');
const { paginate } = require('../helpers/pagination');
const config = require('../config');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const paymentService = require('../services/payment.service');
const notificationService = require('../services/notification.service');
const { PAYMENT_STATUS, PAYMENT_METHODS, ORDER_STATUS } = require('../constants/orderStatus');

const findOwnedOrder = async (orderId, userId) => {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) throw ApiError.notFound('Order not found');
  return order;
};

const createRazorpayOrder = catchAsync(async (req, res) => {
  const { orderId } = req.body;
  const order = await findOwnedOrder(orderId, req.user._id);

  if (order.paymentStatus === PAYMENT_STATUS.PAID) {
    throw ApiError.badRequest('Order has already been paid');
  }

  const razorpayOrder = await paymentService.createRazorpayOrder({
    amount: order.total,
    receipt: order.orderNumber,
    notes: { orderId: order._id.toString(), userId: req.user._id.toString() },
  });

  const payment = await Payment.create({
    order: order._id,
    user: req.user._id,
    method: PAYMENT_METHODS.RAZORPAY,
    provider: 'razorpay',
    amount: order.total,
    providerOrderId: razorpayOrder.id,
    status: PAYMENT_STATUS.PENDING,
  });

  order.payment = payment._id;
  await order.save();

  return sendCreated(res, messages.SUCCESS.CREATED, {
    razorpayOrder,
    keyId: config.razorpay.keyId,
    paymentId: payment._id,
  });
});

const verifyRazorpayPayment = catchAsync(async (req, res) => {
  const { orderId, razorpay_order_id: razorpayOrderId, razorpay_payment_id: razorpayPaymentId, razorpay_signature: razorpaySignature } = req.body;

  const order = await findOwnedOrder(orderId, req.user._id);

  const isValid = paymentService.verifyRazorpaySignature({
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature,
  });

  if (!isValid) {
    throw ApiError.badRequest('Payment verification failed');
  }

  const payment = await Payment.findOne({ order: order._id, providerOrderId: razorpayOrderId });
  if (!payment) throw ApiError.notFound('Payment record not found');

  payment.status = PAYMENT_STATUS.PAID;
  payment.providerPaymentId = razorpayPaymentId;
  payment.providerSignature = razorpaySignature;
  await payment.save();

  order.paymentStatus = PAYMENT_STATUS.PAID;
  order.status = ORDER_STATUS.CONFIRMED;
  order.statusHistory.push({ status: ORDER_STATUS.CONFIRMED, changedBy: req.user._id });
  await order.save();

  await notificationService.notifyOrderStatusChange(order);

  return sendSuccess(res, 'Payment verified successfully', { order, payment });
});

const razorpayWebhook = catchAsync(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const isValid = paymentService.verifyRazorpayWebhookSignature(req.rawBody || JSON.stringify(req.body), signature);

  if (!isValid) {
    return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
  }

  const event = req.body.event;
  if (event === 'payment.captured') {
    const paymentEntity = req.body.payload.payment.entity;
    const payment = await Payment.findOne({ providerOrderId: paymentEntity.order_id });
    if (payment && payment.status !== PAYMENT_STATUS.PAID) {
      payment.status = PAYMENT_STATUS.PAID;
      payment.providerPaymentId = paymentEntity.id;
      await payment.save();

      await Order.findByIdAndUpdate(payment.order, {
        paymentStatus: PAYMENT_STATUS.PAID,
        status: ORDER_STATUS.CONFIRMED,
      });
    }
  }

  return res.status(200).json({ received: true });
});

const createStripeIntent = catchAsync(async (req, res) => {
  const { orderId } = req.body;
  const order = await findOwnedOrder(orderId, req.user._id);

  if (order.paymentStatus === PAYMENT_STATUS.PAID) {
    throw ApiError.badRequest('Order has already been paid');
  }

  const paymentIntent = await paymentService.createStripePaymentIntent({
    amount: order.total,
    metadata: { orderId: order._id.toString(), userId: req.user._id.toString() },
  });

  const payment = await Payment.create({
    order: order._id,
    user: req.user._id,
    method: PAYMENT_METHODS.STRIPE,
    provider: 'stripe',
    amount: order.total,
    providerOrderId: paymentIntent.id,
    status: PAYMENT_STATUS.PENDING,
  });

  order.payment = payment._id;
  await order.save();

  return sendCreated(res, messages.SUCCESS.CREATED, {
    clientSecret: paymentIntent.client_secret,
    publishableKey: config.stripe.publishableKey,
    paymentId: payment._id,
  });
});

const confirmStripePayment = catchAsync(async (req, res) => {
  const { orderId, paymentIntentId } = req.body;

  const order = await findOwnedOrder(orderId, req.user._id);
  const intent = await paymentService.verifyStripePaymentIntent(paymentIntentId);

  if (intent.status !== 'succeeded') {
    throw ApiError.badRequest('Payment has not been completed');
  }

  const payment = await Payment.findOne({ order: order._id, providerOrderId: paymentIntentId });
  if (!payment) throw ApiError.notFound('Payment record not found');

  payment.status = PAYMENT_STATUS.PAID;
  payment.providerPaymentId = intent.id;
  await payment.save();

  order.paymentStatus = PAYMENT_STATUS.PAID;
  order.status = ORDER_STATUS.CONFIRMED;
  order.statusHistory.push({ status: ORDER_STATUS.CONFIRMED, changedBy: req.user._id });
  await order.save();

  await notificationService.notifyOrderStatusChange(order);

  return sendSuccess(res, 'Payment verified successfully', { order, payment });
});

const stripeWebhook = catchAsync(async (req, res) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = paymentService.constructStripeWebhookEvent(req.rawBody, signature);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    const payment = await Payment.findOne({ providerOrderId: intent.id });
    if (payment && payment.status !== PAYMENT_STATUS.PAID) {
      payment.status = PAYMENT_STATUS.PAID;
      payment.providerPaymentId = intent.id;
      await payment.save();

      await Order.findByIdAndUpdate(payment.order, {
        paymentStatus: PAYMENT_STATUS.PAID,
        status: ORDER_STATUS.CONFIRMED,
      });
    }
  }

  return res.status(200).json({ received: true });
});

const refundPayment = catchAsync(async (req, res) => {
  const { orderId, amount, reason } = req.body;

  const order = await Order.findById(orderId).populate('payment');
  if (!order) throw ApiError.notFound('Order not found');

  if (order.paymentStatus !== PAYMENT_STATUS.PAID) {
    throw ApiError.badRequest('Order has not been paid, nothing to refund');
  }

  const payment = order.payment;
  if (!payment) throw ApiError.notFound('Payment record not found');

  let refundResult;
  if (payment.provider === 'razorpay') {
    refundResult = await paymentService.refundRazorpayPayment(payment.providerPaymentId, amount);
    payment.refundId = refundResult.id;
  } else if (payment.provider === 'stripe') {
    refundResult = await paymentService.refundStripePayment(payment.providerPaymentId, amount);
    payment.refundId = refundResult.id;
  } else {
    throw ApiError.badRequest('Refunds are not supported for this payment method');
  }

  payment.status = PAYMENT_STATUS.REFUNDED;
  payment.refundAmount = amount || order.total;
  payment.refundReason = reason || '';
  await payment.save();

  order.paymentStatus = PAYMENT_STATUS.REFUNDED;
  await order.save();

  return sendSuccess(res, 'Refund processed successfully', { payment, refundResult });
});

const getPaymentHistory = catchAsync(async (req, res) => {
  const filter = { user: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const { data, meta } = await paginate(Payment, filter, {
    ...req.query,
    populate: { path: 'order', select: 'orderNumber total status' },
  });

  return sendSuccess(res, messages.SUCCESS.FETCHED, data, meta);
});

const getPaymentById = catchAsync(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate('order');
  if (!payment) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  if (req.user.role !== 'admin' && payment.user.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden(messages.ERROR.FORBIDDEN);
  }

  return sendSuccess(res, messages.SUCCESS.FETCHED, { payment });
});

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  razorpayWebhook,
  createStripeIntent,
  confirmStripePayment,
  stripeWebhook,
  refundPayment,
  getPaymentHistory,
  getPaymentById,
};
