const express = require('express');
const paymentController = require('../controllers/payment.controller');
const validators = require('../validators/payment.validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { ROLES } = require('../constants/roles');

const router = express.Router();

// Webhook routes are mounted with raw body parsing in app.js before this router,
// but are also exposed here for completeness / direct testing.
router.post('/razorpay/webhook', paymentController.razorpayWebhook);
router.post('/stripe/webhook', paymentController.stripeWebhook);

router.use(authenticate);

/**
 * @swagger
 * /payments/razorpay/create-order:
 *   post:
 *     summary: Create a Razorpay order for a placed order
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId]
 *             properties:
 *               orderId: { type: string }
 *     responses:
 *       201:
 *         description: Razorpay order created
 */
router.post(
  '/razorpay/create-order',
  validators.createRazorpayOrder,
  validate,
  paymentController.createRazorpayOrder,
);
router.post(
  '/razorpay/verify',
  validators.verifyRazorpayPayment,
  validate,
  paymentController.verifyRazorpayPayment,
);

router.post('/stripe/create-intent', validators.createStripeIntent, validate, paymentController.createStripeIntent);
router.post(
  '/stripe/confirm',
  validators.confirmStripePayment,
  validate,
  paymentController.confirmStripePayment,
);

router.post(
  '/refund',
  authorize(ROLES.ADMIN, ROLES.RESTAURANT),
  validators.refundPayment,
  validate,
  paymentController.refundPayment,
);

router.get('/history', paymentController.getPaymentHistory);
router.get('/:id', paymentController.getPaymentById);

module.exports = router;
