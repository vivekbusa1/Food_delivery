const { body } = require('express-validator');

const createRazorpayOrder = [
  body('orderId').isMongoId().withMessage('Valid order id is required'),
];

const verifyRazorpayPayment = [
  body('orderId').isMongoId().withMessage('Valid order id is required'),
  body('razorpay_order_id').notEmpty().withMessage('razorpay_order_id is required'),
  body('razorpay_payment_id').notEmpty().withMessage('razorpay_payment_id is required'),
  body('razorpay_signature').notEmpty().withMessage('razorpay_signature is required'),
];

const createStripeIntent = [
  body('orderId').isMongoId().withMessage('Valid order id is required'),
];

const confirmStripePayment = [
  body('orderId').isMongoId().withMessage('Valid order id is required'),
  body('paymentIntentId').notEmpty().withMessage('paymentIntentId is required'),
];

const refundPayment = [
  body('orderId').isMongoId().withMessage('Valid order id is required'),
  body('amount').optional().isFloat({ min: 0 }),
  body('reason').optional().isString(),
];

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createStripeIntent,
  confirmStripePayment,
  refundPayment,
};
