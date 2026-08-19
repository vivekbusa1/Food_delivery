const { body, param } = require('express-validator');

const createFood = [
  body('name').trim().notEmpty().withMessage('Food name is required'),
  body('restaurant').isMongoId().withMessage('Valid restaurant id is required'),
  body('category').isMongoId().withMessage('Valid category id is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('discountPrice').optional().isFloat({ min: 0 }),
  body('isVeg').optional().isBoolean(),
];

const updateFood = [
  param('id').isMongoId().withMessage('Invalid food id'),
  body('price').optional().isFloat({ min: 0 }),
  body('discountPrice').optional().isFloat({ min: 0 }),
];

const createVariant = [
  param('id').isMongoId().withMessage('Invalid food id'),
  body('name').trim().notEmpty().withMessage('Variant name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
];

const createAddon = [
  param('id').isMongoId().withMessage('Invalid food id'),
  body('name').trim().notEmpty().withMessage('Addon name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
];

module.exports = { createFood, updateFood, createVariant, createAddon };
