const { body, param } = require('express-validator');

const addWishlist = [body('foodId').isMongoId().withMessage('Valid food id is required')];
const removeWishlist = [param('foodId').isMongoId().withMessage('Valid food id is required')];

const addFavorite = [body('restaurantId').isMongoId().withMessage('Valid restaurant id is required')];
const removeFavorite = [param('restaurantId').isMongoId().withMessage('Valid restaurant id is required')];

module.exports = { addWishlist, removeWishlist, addFavorite, removeFavorite };
