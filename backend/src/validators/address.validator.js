const { body, param } = require('express-validator');

const createAddress = [
  body('addressLine1').trim().notEmpty().withMessage('Address line 1 is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('zipCode').trim().notEmpty().withMessage('Zip code is required'),
  body('label').optional().isIn(['home', 'work', 'other']),
  body('location.coordinates').optional().isArray({ min: 2, max: 2 }),
];

const updateAddress = [
  param('id').isMongoId().withMessage('Invalid address id'),
];

module.exports = { createAddress, updateAddress };
