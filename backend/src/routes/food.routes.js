const express = require('express');
const foodController = require('../controllers/food.controller');
const validators = require('../validators/food.validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const upload = require('../middleware/upload');
const { ROLES } = require('../constants/roles');

const router = express.Router();

/**
 * @swagger
 * /foods:
 *   get:
 *     summary: List/search foods with filters
 *     tags: [Foods]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: restaurant
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: isVeg
 *         schema: { type: boolean }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *     responses:
 *       200:
 *         description: Paginated list of foods
 *   post:
 *     summary: Create a new food item (restaurant owner or admin)
 *     tags: [Foods]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Food created successfully
 */
router.get('/', foodController.listFoods);

router.post(
  '/',
  authenticate,
  authorize(ROLES.RESTAURANT, ROLES.ADMIN),
  upload.array('images', 5),
  validators.createFood,
  validate,
  foodController.createFood,
);

/**
 * @swagger
 * /foods/{id}:
 *   get:
 *     summary: Get a food item by id
 *     tags: [Foods]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Food details with variants and addons
 */
router.get('/:id', foodController.getFoodById);

router.patch(
  '/:id',
  authenticate,
  authorize(ROLES.RESTAURANT, ROLES.ADMIN),
  upload.array('images', 5),
  validators.updateFood,
  validate,
  foodController.updateFood,
);

router.delete('/:id', authenticate, authorize(ROLES.RESTAURANT, ROLES.ADMIN), foodController.deleteFood);

router.patch(
  '/:id/toggle-availability',
  authenticate,
  authorize(ROLES.RESTAURANT, ROLES.ADMIN),
  foodController.toggleAvailability,
);

router.post(
  '/:id/variants',
  authenticate,
  authorize(ROLES.RESTAURANT, ROLES.ADMIN),
  validators.createVariant,
  validate,
  foodController.createVariant,
);
router.patch(
  '/:id/variants/:variantId',
  authenticate,
  authorize(ROLES.RESTAURANT, ROLES.ADMIN),
  foodController.updateVariant,
);
router.delete(
  '/:id/variants/:variantId',
  authenticate,
  authorize(ROLES.RESTAURANT, ROLES.ADMIN),
  foodController.deleteVariant,
);

router.post(
  '/:id/addons',
  authenticate,
  authorize(ROLES.RESTAURANT, ROLES.ADMIN),
  validators.createAddon,
  validate,
  foodController.createAddon,
);
router.patch(
  '/:id/addons/:addonId',
  authenticate,
  authorize(ROLES.RESTAURANT, ROLES.ADMIN),
  foodController.updateAddon,
);
router.delete(
  '/:id/addons/:addonId',
  authenticate,
  authorize(ROLES.RESTAURANT, ROLES.ADMIN),
  foodController.deleteAddon,
);

module.exports = router;
