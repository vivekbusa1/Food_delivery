const { body } = require('express-validator');

const register = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').optional().isMobilePhone('any').withMessage('Valid phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['customer', 'restaurant', 'delivery']).withMessage('Invalid role'),
  body().custom((value) => {
    if (!value.email && !value.phone) {
      throw new Error('Either email or phone is required');
    }
    return true;
  }),
];

const login = [
  body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').optional().isMobilePhone('any').withMessage('Valid phone number is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body().custom((value) => {
    if (!value.email && !value.phone) {
      throw new Error('Either email or phone is required');
    }
    return true;
  }),
];

const sendOtp = [
  body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').optional().isMobilePhone('any').withMessage('Valid phone number is required'),
  body('purpose')
    .optional()
    .isIn(['verification', 'login', 'reset_password'])
    .withMessage('Invalid purpose'),
  body().custom((value) => {
    if (!value.email && !value.phone) {
      throw new Error('Either email or phone is required');
    }
    return true;
  }),
];

const verifyOtp = [
  body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').optional().isMobilePhone('any').withMessage('Valid phone number is required'),
  body('otp').isLength({ min: 4, max: 6 }).withMessage('Invalid OTP'),
  body('purpose')
    .optional()
    .isIn(['verification', 'login', 'reset_password'])
    .withMessage('Invalid purpose'),
];

const forgotPassword = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
];

const resetPassword = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const changePassword = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

const refreshToken = [
  body('refreshToken').optional().isString(),
];

module.exports = {
  register,
  login,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
  changePassword,
  refreshToken,
};
