const express = require('express');
const wishlistController = require('../controllers/wishlist.controller');
const validators = require('../validators/wishlist.validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', wishlistController.listFavoriteRestaurants);
router.post('/', validators.addFavorite, validate, wishlistController.addFavoriteRestaurant);
router.delete(
  '/:restaurantId',
  validators.removeFavorite,
  validate,
  wishlistController.removeFavoriteRestaurant,
);

module.exports = router;
