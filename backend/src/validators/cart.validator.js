const { body, param } = require('express-validator');

const addToCart = [
  body('food').isMongoId().withMessage('Valid food id is required'),
  body('variant').optional().isMongoId().withMessage('Invalid variant id'),
  body('addons').optional().isArray().withMessage('Addons must be an array'),
  body('addons.*').optional().isMongoId().withMessage('Invalid addon id'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('specialInstructions').optional().isString(),
];

const updateCartItem = [
  param('itemId').isMongoId().withMessage('Invalid cart item id'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

const applyCoupon = [
  body('code').trim().notEmpty().withMessage('Coupon code is required'),
];

module.exports = { addToCart, updateCartItem, applyCoupon };
