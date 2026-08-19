const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { sendSuccess, sendCreated } = require('../helpers/response');
const messages = require('../constants/messages');
const { paginate } = require('../helpers/pagination');
const Review = require('../models/Review');
const Rating = require('../models/Rating');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const DeliveryPartner = require('../models/DeliveryPartner');
const uploadService = require('../services/upload.service');
const { ORDER_STATUS } = require('../constants/orderStatus');

const recalculateRestaurantRating = async (restaurantId) => {
  const stats = await Review.aggregate([
    { $match: { restaurant: restaurantId, isVisible: true } },
    { $group: { _id: '$restaurant', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const { avg = 0, count = 0 } = stats[0] || {};
  await Restaurant.findByIdAndUpdate(restaurantId, {
    ratingsAverage: Math.round(avg * 10) / 10,
    ratingsCount: count,
  });
};

const recalculateFoodRating = async (foodId) => {
  const stats = await Review.aggregate([
    { $match: { food: foodId, isVisible: true } },
    { $group: { _id: '$food', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const { avg = 0, count = 0 } = stats[0] || {};
  await Food.findByIdAndUpdate(foodId, {
    ratingsAverage: Math.round(avg * 10) / 10,
    ratingsCount: count,
  });
};

const recalculateDeliveryPartnerRating = async (partnerId) => {
  const stats = await Rating.aggregate([
    { $match: { deliveryPartner: partnerId, targetType: 'delivery_partner' } },
    { $group: { _id: '$deliveryPartner', avg: { $avg: '$score' }, count: { $sum: 1 } } },
  ]);

  const { avg = 0, count = 0 } = stats[0] || {};
  await DeliveryPartner.findByIdAndUpdate(partnerId, {
    ratingsAverage: Math.round(avg * 10) / 10,
    ratingsCount: count,
  });
};

const createReview = catchAsync(async (req, res) => {
  const { orderId, restaurantId, foodId, rating, comment } = req.body;

  const order = await Order.findOne({ _id: orderId, user: req.user._id });
  if (!order) throw ApiError.notFound('Order not found');
  if (order.status !== ORDER_STATUS.DELIVERED) {
    throw ApiError.badRequest('You can only review delivered orders');
  }

  const images = req.files ? uploadService.mapUploadedFiles(req.files) : [];

  const review = await Review.create({
    user: req.user._id,
    order: orderId,
    restaurant: restaurantId || order.restaurant,
    food: foodId || null,
    rating,
    comment,
    images,
  });

  order.isReviewed = true;
  await order.save();

  if (review.restaurant) await recalculateRestaurantRating(review.restaurant);
  if (review.food) await recalculateFoodRating(review.food);

  return sendCreated(res, messages.SUCCESS.CREATED, { review });
});

const listRestaurantReviews = catchAsync(async (req, res) => {
  const filter = { restaurant: req.params.restaurantId, isVisible: true };

  const { data, meta } = await paginate(Review, filter, {
    ...req.query,
    populate: { path: 'user', select: 'name avatar' },
  });

  return sendSuccess(res, messages.SUCCESS.FETCHED, data, meta);
});

const listFoodReviews = catchAsync(async (req, res) => {
  const filter = { food: req.params.foodId, isVisible: true };

  const { data, meta } = await paginate(Review, filter, {
    ...req.query,
    populate: { path: 'user', select: 'name avatar' },
  });

  return sendSuccess(res, messages.SUCCESS.FETCHED, data, meta);
});

const replyToReview = catchAsync(async (req, res) => {
  const { text } = req.body;

  const review = await Review.findById(req.params.id).populate('restaurant');
  if (!review) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  if (req.user.role !== 'admin' && review.restaurant?.owner?.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden(messages.ERROR.FORBIDDEN);
  }

  review.reply = { text, repliedAt: new Date(), repliedBy: req.user._id };
  await review.save();

  return sendSuccess(res, messages.SUCCESS.UPDATED, { review });
});

const deleteReview = catchAsync(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  if (req.user.role !== 'admin' && review.user.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden(messages.ERROR.FORBIDDEN);
  }

  await review.deleteOne();

  if (review.restaurant) await recalculateRestaurantRating(review.restaurant);
  if (review.food) await recalculateFoodRating(review.food);

  return sendSuccess(res, messages.SUCCESS.DELETED);
});

const createRating = catchAsync(async (req, res) => {
  const { orderId, targetType, score, feedback } = req.body;

  const order = await Order.findOne({ _id: orderId, user: req.user._id });
  if (!order) throw ApiError.notFound('Order not found');

  const ratingData = {
    user: req.user._id,
    order: orderId,
    targetType,
    score,
    feedback,
  };

  if (targetType === 'delivery_partner') {
    if (!order.deliveryPartner) throw ApiError.badRequest('This order has no delivery partner assigned');
    ratingData.deliveryPartner = order.deliveryPartner;
  } else if (targetType === 'restaurant') {
    ratingData.restaurant = order.restaurant;
  }

  const rating = await Rating.create(ratingData);

  if (targetType === 'delivery_partner') {
    await recalculateDeliveryPartnerRating(order.deliveryPartner);
  }

  return sendCreated(res, messages.SUCCESS.CREATED, { rating });
});

module.exports = {
  createReview,
  listRestaurantReviews,
  listFoodReviews,
  replyToReview,
  deleteReview,
  createRating,
};
