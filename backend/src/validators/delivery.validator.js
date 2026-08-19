const { body, param } = require('express-validator');

const registerPartner = [
  body('vehicleType').optional().isIn(['bike', 'scooter', 'bicycle', 'car']),
  body('vehicleNumber').optional().isString(),
  body('licenseNumber').optional().isString(),
];

const updateLocation = [
  body('lng').isFloat().withMessage('Longitude is required'),
  body('lat').isFloat().withMessage('Latitude is required'),
];

const updateAvailability = [
  body('isOnline').optional().isBoolean(),
  body('isAvailable').optional().isBoolean(),
];

const orderAction = [
  param('orderId').isMongoId().withMessage('Invalid order id'),
];

const requestWithdraw = [
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
  body('bankDetails').optional().isObject(),
];

const processWithdraw = [
  param('id').isMongoId().withMessage('Invalid withdraw id'),
  body('status').isIn(['approved', 'rejected', 'paid']).withMessage('Invalid status'),
  body('rejectionReason').optional().isString(),
  body('transactionRef').optional().isString(),
];

module.exports = {
  registerPartner,
  updateLocation,
  updateAvailability,
  orderAction,
  requestWithdraw,
  processWithdraw,
};
