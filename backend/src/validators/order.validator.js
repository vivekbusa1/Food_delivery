const { body, param } = require('express-validator');
const { ORDER_STATUS, PAYMENT_METHODS } = require('../constants/orderStatus');

/** Map mobile-app payment labels onto backend enum values. */
const normalizePaymentMethod = (value) => {
  const aliases = {
    cash: PAYMENT_METHODS.COD,
    cod: PAYMENT_METHODS.COD,
    card: PAYMENT_METHODS.RAZORPAY,
    upi: PAYMENT_METHODS.RAZORPAY,
    razorpay: PAYMENT_METHODS.RAZORPAY,
    stripe: PAYMENT_METHODS.STRIPE,
    wallet: PAYMENT_METHODS.WALLET,
  };
  const key = String(value ?? '')
    .trim()
    .toLowerCase();
  return aliases[key] || value;
};

const createOrder = [
  body('addressId').optional().isMongoId().withMessage('Invalid address id'),
  body('deliveryAddress').optional().isObject(),
  body('paymentMethod')
    .customSanitizer(normalizePaymentMethod)
    .isIn(Object.values(PAYMENT_METHODS))
    .withMessage('Invalid payment method'),
  body('tipAmount').optional().isFloat({ min: 0 }),
  body('specialInstructions').optional().isString(),
];

const updateOrderStatus = [
  param('id').isMongoId().withMessage('Invalid order id'),
  body('status').isIn(Object.values(ORDER_STATUS)).withMessage('Invalid order status'),
  body('note').optional().isString(),
];

const cancelOrder = [
  param('id').isMongoId().withMessage('Invalid order id'),
  body('reason').optional().isString(),
];

module.exports = { createOrder, updateOrderStatus, cancelOrder };
