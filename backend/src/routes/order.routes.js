const express = require('express');
const orderController = require('../controllers/order.controller');
const validators = require('../validators/order.validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.use(authenticate);

router.get('/status-flow', orderController.getOrderStatusFlow);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Place an order from the current cart
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [paymentMethod]
 *             properties:
 *               addressId: { type: string }
 *               deliveryAddress: { type: object }
 *               paymentMethod: { type: string, enum: [cod, razorpay, stripe, wallet] }
 *               tipAmount: { type: number }
 *               specialInstructions: { type: string }
 *     responses:
 *       201:
 *         description: Order created successfully
 */
router.post('/', validators.createOrder, validate, orderController.createOrder);

/**
 * @swagger
 * /orders/my:
 *   get:
 *     summary: Get the current user's orders
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Paginated list of the user's orders
 */
router.get('/my', orderController.getMyOrders);
router.get(
  '/restaurant/:restaurantId',
  authorize(ROLES.RESTAURANT, ROLES.ADMIN),
  orderController.getRestaurantOrders,
);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order details by id
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Order details
 */
router.get('/:id', orderController.getOrderById);

/**
 * @swagger
 * /orders/{id}/track:
 *   get:
 *     summary: Track order status and delivery partner location
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Order tracking information
 */
router.get('/:id/track', orderController.trackOrder);
router.patch(
  '/:id/status',
  authorize(ROLES.RESTAURANT, ROLES.ADMIN),
  validators.updateOrderStatus,
  validate,
  orderController.updateOrderStatus,
);
router.patch('/:id/cancel', validators.cancelOrder, validate, orderController.cancelOrder);
router.post('/:id/reorder', orderController.reorder);
router.patch(
  '/:id/assign-delivery',
  authorize(ROLES.ADMIN, ROLES.RESTAURANT),
  orderController.assignDeliveryPartner,
);

module.exports = router;
