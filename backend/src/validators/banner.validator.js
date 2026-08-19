const { body, param } = require('express-validator');

const createBanner = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('image.url').optional().isString(),
  body('linkType').optional().isIn(['restaurant', 'food', 'category', 'offer', 'url', 'none']),
  body('position').optional().isIn(['home_top', 'home_middle', 'home_bottom', 'restaurant_page']),
];

const updateBanner = [param('id').isMongoId().withMessage('Invalid banner id')];

const createOffer = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('discountType').isIn(['percentage', 'flat']).withMessage('Invalid discount type'),
  body('discountValue').isFloat({ min: 0 }).withMessage('Discount value must be positive'),
  body('validUntil').isISO8601().withMessage('Valid until date is required'),
];

const updateOffer = [param('id').isMongoId().withMessage('Invalid offer id')];

module.exports = { createBanner, updateBanner, createOffer, updateOffer };
