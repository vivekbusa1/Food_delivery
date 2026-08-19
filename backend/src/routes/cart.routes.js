const express = require('express');
const cartController = require('../controllers/cart.controller');
const validators = require('../validators/cart.validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get the current user's cart
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Current cart with populated items
 */
router.get('/', cartController.getCart);

/**
 * @swagger
 * /cart/items:
 *   post:
 *     summary: Add an item to the cart
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [food]
 *             properties:
 *               food: { type: string }
 *               variant: { type: string }
 *               addons: { type: array, items: { type: string } }
 *               quantity: { type: integer }
 *               specialInstructions: { type: string }
 *     responses:
 *       200:
 *         description: Updated cart
 */
router.post('/items', validators.addToCart, validate, cartController.addToCart);
router.patch('/items/:itemId', validators.updateCartItem, validate, cartController.updateCartItem);
router.delete('/items/:itemId', cartController.removeCartItem);
router.delete('/', cartController.clearCart);
router.post('/coupon', validators.applyCoupon, validate, cartController.applyCoupon);
router.delete('/coupon', cartController.removeCoupon);

module.exports = router;
