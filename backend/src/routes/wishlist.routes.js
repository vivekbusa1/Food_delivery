const express = require('express');
const wishlistController = require('../controllers/wishlist.controller');
const validators = require('../validators/wishlist.validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', wishlistController.listWishlist);
router.post('/', validators.addWishlist, validate, wishlistController.addToWishlist);
router.delete('/:foodId', validators.removeWishlist, validate, wishlistController.removeFromWishlist);

module.exports = router;
