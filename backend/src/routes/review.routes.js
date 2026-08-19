const express = require('express');
const reviewController = require('../controllers/review.controller');
const validators = require('../validators/review.validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/restaurant/:restaurantId', reviewController.listRestaurantReviews);
router.get('/food/:foodId', reviewController.listFoodReviews);

router.post(
  '/',
  authenticate,
  upload.array('images', 3),
  validators.createReview,
  validate,
  reviewController.createReview,
);
router.patch('/:id/reply', authenticate, validators.replyToReview, validate, reviewController.replyToReview);
router.delete('/:id', authenticate, reviewController.deleteReview);

router.post('/ratings', authenticate, validators.createRating, validate, reviewController.createRating);

module.exports = router;
