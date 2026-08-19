const { body, param } = require('express-validator');

const createCoupon = [
  body('code').trim().notEmpty().withMessage('Coupon code is required'),
  body('discountType').isIn(['percentage', 'flat']).withMessage('Invalid discount type'),
  body('discountValue').isFloat({ min: 0 }).withMessage('Discount value must be positive'),
  body('validUntil').isISO8601().withMessage('Valid until date is required'),
  body('minOrderAmount').optional().isFloat({ min: 0 }),
  body('restaurant').optional().isMongoId(),
];

const updateCoupon = [
  param('id').isMongoId().withMessage('Invalid coupon id'),
];

const validateCoupon = [
  body('code').trim().notEmpty().withMessage('Coupon code is required'),
  body('restaurantId').isMongoId().withMessage('Valid restaurant id is required'),
  body('subTotal').isFloat({ min: 0 }).withMessage('Subtotal is required'),
];

module.exports = { createCoupon, updateCoupon, validateCoupon };
