const { body, param } = require('express-validator');

const createFoodCategory = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('restaurant').optional().isMongoId().withMessage('Invalid restaurant id'),
  body('isGlobal').optional().isBoolean(),
];

const createRestaurantCategory = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
];

const updateCategory = [
  param('id').isMongoId().withMessage('Invalid category id'),
  body('name').optional().trim().notEmpty(),
];

module.exports = { createFoodCategory, createRestaurantCategory, updateCategory };
