const express = require('express');
const authController = require('../controllers/auth.controller');
const validators = require('../validators/auth.validator');
const validate = require('../middleware/validate');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               password: { type: string }
 *               role: { type: string, enum: [customer, restaurant, delivery] }
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register', authLimiter, validators.register, validate, authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email/phone and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               email: { type: string }
 *               phone: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Logged in successfully
 */
router.post('/login', authLimiter, validators.login, validate, authController.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout current user
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', optionalAuth, authController.logout);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 */
router.post('/refresh-token', validators.refreshToken, validate, authController.refresh);

/**
 * @swagger
 * /auth/otp/send:
 *   post:
 *     summary: Send OTP to email or phone
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: OTP sent successfully
 */
router.post('/otp/send', otpLimiter, validators.sendOtp, validate, authController.sendOtp);

/**
 * @swagger
 * /auth/otp/verify:
 *   post:
 *     summary: Verify OTP
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: OTP verified successfully
 */
router.post('/otp/verify', otpLimiter, validators.verifyOtp, validate, authController.verifyOtp);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset link
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Reset instructions sent if the email is registered
 */
router.post('/forgot-password', authLimiter, validators.forgotPassword, validate, authController.forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using a reset token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Password reset successfully
 */
router.post('/reset-password', authLimiter, validators.resetPassword, validate, authController.resetPassword);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change password for logged-in user
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
router.post(
  '/change-password',
  authenticate,
  validators.changePassword,
  validate,
  authController.changePassword,
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get currently authenticated user
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Current user profile
 */
router.get('/me', authenticate, authController.me);

module.exports = router;
