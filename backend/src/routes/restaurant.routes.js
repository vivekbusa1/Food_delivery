const express = require('express');
const restaurantController = require('../controllers/restaurant.controller');
const validators = require('../validators/restaurant.validator');
const validate = require('../middleware/validate');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const upload = require('../middleware/upload');
const { ROLES } = require('../constants/roles');

const router = express.Router();

/**
 * @swagger
 * /restaurants/nearby:
 *   get:
 *     summary: Find restaurants near a geolocation
 *     tags: [Restaurants]
 *     parameters:
 *       - in: query
 *         name: lng
 *         schema: { type: number }
 *         required: true
 *       - in: query
 *         name: lat
 *         schema: { type: number }
 *         required: true
 *       - in: query
 *         name: radius
 *         schema: { type: number }
 *         description: Radius in kilometers
 *     responses:
 *       200:
 *         description: List of nearby restaurants
 */
router.get('/nearby', validators.nearbySearch, validate, restaurantController.nearbyRestaurants);

/**
 * @swagger
 * /restaurants:
 *   get:
 *     summary: List restaurants with filters and pagination
 *     tags: [Restaurants]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated list of restaurants
 *   post:
 *     summary: Create a new restaurant (restaurant owner or admin)
 *     tags: [Restaurants]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Restaurant created successfully
 */
router.get('/', optionalAuth, restaurantController.listRestaurants);

router.post(
  '/',
  authenticate,
  authorize(ROLES.RESTAURANT, ROLES.ADMIN),
  validators.createRestaurant,
  validate,
  restaurantController.createRestaurant,
);

router.get(
  '/me/profile',
  authenticate,
  authorize(ROLES.RESTAURANT),
  restaurantController.getMyRestaurant,
);

/**
 * @swagger
 * /restaurants/{id}:
 *   get:
 *     summary: Get a restaurant by id
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Restaurant details including timings and gallery
 *       404:
 *         description: Restaurant not found
 */
router.get('/:id', restaurantController.getRestaurantById);

router.patch(
  '/:id',
  authenticate,
  authorize(ROLES.RESTAURANT, ROLES.ADMIN),
  validators.updateRestaurant,
  validate,
  restaurantController.updateRestaurant,
);

router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.RESTAURANT, ROLES.ADMIN),
  restaurantController.deleteRestaurant,
);

router.patch(
  '/:id/logo',
  authenticate,
  authorize(ROLES.RESTAURANT, ROLES.ADMIN),
  upload.single('logo'),
  restaurantController.updateLogo,
);

router.patch(
  '/:id/cover',
  authenticate,
  authorize(ROLES.RESTAURANT, ROLES.ADMIN),
  upload.single('cover'),
  restaurantController.updateCover,
);

router.patch(
  '/:id/toggle-open',
  authenticate,
  authorize(ROLES.RESTAURANT, ROLES.ADMIN),
  restaurantController.toggleOpenStatus,
);

router.patch(
  '/:id/approve',
  authenticate,
  authorize(ROLES.ADMIN),
  validators.approveRestaurant,
  validate,
  restaurantController.approveRestaurant,
);

router.get('/:id/timings', restaurantController.getTimings);
router.put(
  '/:id/timings',
  authenticate,
  authorize(ROLES.RESTAURANT, ROLES.ADMIN),
  validators.upsertTiming,
  validate,
  restaurantController.upsertTiming,
);

router.post(
  '/:id/gallery',
  authenticate,
  authorize(ROLES.RESTAURANT, ROLES.ADMIN),
  upload.single('image'),
  restaurantController.addGalleryImage,
);
router.delete(
  '/:id/gallery/:imageId',
  authenticate,
  authorize(ROLES.RESTAURANT, ROLES.ADMIN),
  restaurantController.deleteGalleryImage,
);

module.exports = router;
