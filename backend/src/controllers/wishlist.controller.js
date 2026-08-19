const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { sendSuccess, sendCreated } = require('../helpers/response');
const messages = require('../constants/messages');
const Wishlist = require('../models/Wishlist');
const FavoriteRestaurant = require('../models/FavoriteRestaurant');
const Food = require('../models/Food');
const Restaurant = require('../models/Restaurant');

const addToWishlist = catchAsync(async (req, res) => {
  const { foodId } = req.body;

  const food = await Food.findById(foodId);
  if (!food) throw ApiError.notFound('Food not found');

  const existing = await Wishlist.findOne({ user: req.user._id, food: foodId });
  if (existing) throw ApiError.conflict('Food already in wishlist');

  const wishlistItem = await Wishlist.create({ user: req.user._id, food: foodId });

  return sendCreated(res, messages.SUCCESS.CREATED, { wishlistItem });
});

const listWishlist = catchAsync(async (req, res) => {
  const wishlist = await Wishlist.find({ user: req.user._id })
    .populate('food')
    .sort({ createdAt: -1 });

  return sendSuccess(res, messages.SUCCESS.FETCHED, { wishlist });
});

const removeFromWishlist = catchAsync(async (req, res) => {
  const result = await Wishlist.findOneAndDelete({ user: req.user._id, food: req.params.foodId });
  if (!result) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  return sendSuccess(res, messages.SUCCESS.DELETED);
});

const addFavoriteRestaurant = catchAsync(async (req, res) => {
  const { restaurantId } = req.body;

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw ApiError.notFound('Restaurant not found');

  const existing = await FavoriteRestaurant.findOne({ user: req.user._id, restaurant: restaurantId });
  if (existing) throw ApiError.conflict('Restaurant already in favorites');

  const favorite = await FavoriteRestaurant.create({ user: req.user._id, restaurant: restaurantId });

  return sendCreated(res, messages.SUCCESS.CREATED, { favorite });
});

const listFavoriteRestaurants = catchAsync(async (req, res) => {
  const favorites = await FavoriteRestaurant.find({ user: req.user._id })
    .populate('restaurant')
    .sort({ createdAt: -1 });

  return sendSuccess(res, messages.SUCCESS.FETCHED, { favorites });
});

const removeFavoriteRestaurant = catchAsync(async (req, res) => {
  const result = await FavoriteRestaurant.findOneAndDelete({
    user: req.user._id,
    restaurant: req.params.restaurantId,
  });
  if (!result) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  return sendSuccess(res, messages.SUCCESS.DELETED);
});

module.exports = {
  addToWishlist,
  listWishlist,
  removeFromWishlist,
  addFavoriteRestaurant,
  listFavoriteRestaurants,
  removeFavoriteRestaurant,
};
