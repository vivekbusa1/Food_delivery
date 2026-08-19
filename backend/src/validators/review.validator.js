const { body, param } = require('express-validator');

const createReview = [
  body('orderId').isMongoId().withMessage('Valid order id is required'),
  body('restaurantId').optional().isMongoId(),
  body('foodId').optional().isMongoId(),
  body('rating').isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isString().isLength({ max: 1000 }),
];

const replyToReview = [
  param('id').isMongoId().withMessage('Invalid review id'),
  body('text').trim().notEmpty().withMessage('Reply text is required'),
];

const createRating = [
  body('orderId').isMongoId().withMessage('Valid order id is required'),
  body('targetType').isIn(['delivery_partner', 'restaurant', 'food']).withMessage('Invalid target type'),
  body('score').isFloat({ min: 1, max: 5 }).withMessage('Score must be between 1 and 5'),
];

module.exports = { createReview, replyToReview, createRating };
