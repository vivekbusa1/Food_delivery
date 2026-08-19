const { body, param } = require('express-validator');

const updateProfile = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('dob').optional().isISO8601().withMessage('Invalid date of birth'),
];

const mongoIdParam = (name = 'id') => [
  param(name).isMongoId().withMessage(`Invalid ${name}`),
];

const updateUserStatus = [
  param('id').isMongoId().withMessage('Invalid user id'),
  body('isBlocked').optional().isBoolean(),
  body('isActive').optional().isBoolean(),
];

module.exports = { updateProfile, mongoIdParam, updateUserStatus };
