const crypto = require('crypto');
const Razorpay = require('razorpay');
const Stripe = require('stripe');
const config = require('../config');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

let razorpayInstance = null;
const getRazorpay = () => {
  if (razorpayInstance) return razorpayInstance;
  if (!config.razorpay.keyId || !config.razorpay.keySecret) {
    logger.warn('Razorpay keys are not configured');
    return null;
  }
  razorpayInstance = new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
  });
  return razorpayInstance;
};

let stripeInstance = null;
const getStripe = () => {
  if (stripeInstance) return stripeInstance;
  if (!config.stripe.secretKey) {
    logger.warn('Stripe secret key is not configured');
    return null;
  }
  stripeInstance = new Stripe(config.stripe.secretKey);
  return stripeInstance;
};

const createRazorpayOrder = async ({ amount, currency = 'INR', receipt, notes = {} }) => {
  const razorpay = getRazorpay();
  if (!razorpay) {
    throw ApiError.internal('Razorpay is not configured on this server');
  }

  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency,
    receipt,
    notes,
  });

  return order;
};

const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  if (!config.razorpay.keySecret) {
    throw ApiError.internal('Razorpay is not configured on this server');
  }

  const generatedSignature = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
};

const verifyRazorpayWebhookSignature = (rawBody, signature) => {
  if (!config.razorpay.webhookSecret) return false;
  const expected = crypto
    .createHmac('sha256', config.razorpay.webhookSecret)
    .update(rawBody)
    .digest('hex');
  return expected === signature;
};

const refundRazorpayPayment = async (paymentId, amount) => {
  const razorpay = getRazorpay();
  if (!razorpay) {
    throw ApiError.internal('Razorpay is not configured on this server');
  }
  const refundOptions = amount ? { amount: Math.round(amount * 100) } : {};
  return razorpay.payments.refund(paymentId, refundOptions);
};

const createStripePaymentIntent = async ({ amount, currency = 'inr', metadata = {} }) => {
  const stripe = getStripe();
  if (!stripe) {
    throw ApiError.internal('Stripe is not configured on this server');
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    metadata,
    automatic_payment_methods: { enabled: true },
  });

  return paymentIntent;
};

const verifyStripePaymentIntent = async (paymentIntentId) => {
  const stripe = getStripe();
  if (!stripe) {
    throw ApiError.internal('Stripe is not configured on this server');
  }
  return stripe.paymentIntents.retrieve(paymentIntentId);
};

const refundStripePayment = async (paymentIntentId, amount) => {
  const stripe = getStripe();
  if (!stripe) {
    throw ApiError.internal('Stripe is not configured on this server');
  }
  const refundOptions = { payment_intent: paymentIntentId };
  if (amount) refundOptions.amount = Math.round(amount * 100);
  return stripe.refunds.create(refundOptions);
};

const constructStripeWebhookEvent = (rawBody, signature) => {
  const stripe = getStripe();
  if (!stripe) {
    throw ApiError.internal('Stripe is not configured on this server');
  }
  return stripe.webhooks.constructEvent(rawBody, signature, config.stripe.webhookSecret);
};

module.exports = {
  getRazorpay,
  getStripe,
  createRazorpayOrder,
  verifyRazorpaySignature,
  verifyRazorpayWebhookSignature,
  refundRazorpayPayment,
  createStripePaymentIntent,
  verifyStripePaymentIntent,
  refundStripePayment,
  constructStripeWebhookEvent,
};
