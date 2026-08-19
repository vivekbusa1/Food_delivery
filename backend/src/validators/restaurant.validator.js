const { body, param, query } = require('express-validator');

const createRestaurant = [
  body('name').trim().notEmpty().withMessage('Restaurant name is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().isString(),
  body('address.city').optional().isString(),
  body('location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be [longitude, latitude]'),
  body('minOrderAmount').optional().isFloat({ min: 0 }),
  body('deliveryFee').optional().isFloat({ min: 0 }),
];

const updateRestaurant = [
  param('id').isMongoId().withMessage('Invalid restaurant id'),
  body('name').optional().trim().notEmpty(),
  body('minOrderAmount').optional().isFloat({ min: 0 }),
  body('deliveryFee').optional().isFloat({ min: 0 }),
];

const nearbySearch = [
  query('lng').isFloat().withMessage('Longitude is required'),
  query('lat').isFloat().withMessage('Latitude is required'),
  query('radius').optional().isFloat({ min: 0.1 }),
];

const approveRestaurant = [
  param('id').isMongoId().withMessage('Invalid restaurant id'),
  body('approvalStatus').isIn(['approved', 'rejected']).withMessage('Invalid approval status'),
  body('rejectionReason').optional().isString(),
];

const upsertTiming = [
  param('id').isMongoId().withMessage('Invalid restaurant id'),
  body('day')
    .isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .withMessage('Invalid day'),
  body('isOpen').optional().isBoolean(),
  body('openTime').optional().isString(),
  body('closeTime').optional().isString(),
];

module.exports = {
  createRestaurant,
  updateRestaurant,
  nearbySearch,
  approveRestaurant,
  upsertTiming,
};
