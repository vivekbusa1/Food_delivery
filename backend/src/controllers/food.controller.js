const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { sendSuccess, sendCreated } = require('../helpers/response');
const messages = require('../constants/messages');
const { paginate } = require('../helpers/pagination');
const Food = require('../models/Food');
const FoodVariant = require('../models/FoodVariant');
const Addon = require('../models/Addon');
const Restaurant = require('../models/Restaurant');
const uploadService = require('../services/upload.service');
const { ROLES } = require('../constants/roles');

const ensureRestaurantAccess = async (restaurantId, user) => {
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw ApiError.notFound('Restaurant not found');
  if (user.role !== ROLES.ADMIN && restaurant.owner.toString() !== user._id.toString()) {
    throw ApiError.forbidden(messages.ERROR.FORBIDDEN);
  }
  return restaurant;
};

const createFood = catchAsync(async (req, res) => {
  await ensureRestaurantAccess(req.body.restaurant, req.user);

  const images = req.files ? uploadService.mapUploadedFiles(req.files) : [];

  const food = await Food.create({ ...req.body, images });

  return sendCreated(res, messages.SUCCESS.CREATED, { food });
});

const listFoods = catchAsync(async (req, res) => {
  const filter = { isActive: true };

  if (req.query.restaurant) filter.restaurant = req.query.restaurant;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.isVeg !== undefined) filter.isVeg = req.query.isVeg === 'true';
  if (req.query.isAvailable !== undefined) filter.isAvailable = req.query.isAvailable === 'true';
  if (req.query.isFeatured !== undefined) filter.isFeatured = req.query.isFeatured === 'true';
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
  }
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  const { data, meta } = await paginate(Food, filter, {
    ...req.query,
    populate: [
      { path: 'category' },
      { path: 'variants' },
      { path: 'addons' },
    ],
  });

  return sendSuccess(res, messages.SUCCESS.FETCHED, data, meta);
});

const getFoodById = catchAsync(async (req, res) => {
  const food = await Food.findById(req.params.id)
    .populate('category')
    .populate('variants')
    .populate('addons')
    .populate('restaurant', 'name logo isOpen deliveryFee minOrderAmount');

  if (!food) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  return sendSuccess(res, messages.SUCCESS.FETCHED, { food });
});

const updateFood = catchAsync(async (req, res) => {
  const food = await Food.findById(req.params.id);
  if (!food) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  await ensureRestaurantAccess(food.restaurant, req.user);

  const restrictedFields = ['restaurant', 'ratingsAverage', 'ratingsCount', 'totalOrders'];
  restrictedFields.forEach((field) => delete req.body[field]);

  if (req.files && req.files.length) {
    const newImages = uploadService.mapUploadedFiles(req.files);
    food.images = [...food.images, ...newImages];
  }

  Object.assign(food, req.body);
  await food.save();

  return sendSuccess(res, messages.SUCCESS.UPDATED, { food });
});

const deleteFood = catchAsync(async (req, res) => {
  const food = await Food.findById(req.params.id);
  if (!food) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  await ensureRestaurantAccess(food.restaurant, req.user);

  food.isActive = false;
  food.isAvailable = false;
  await food.save();

  return sendSuccess(res, messages.SUCCESS.DELETED);
});

const toggleAvailability = catchAsync(async (req, res) => {
  const food = await Food.findById(req.params.id);
  if (!food) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  await ensureRestaurantAccess(food.restaurant, req.user);

  food.isAvailable = !food.isAvailable;
  await food.save();

  return sendSuccess(res, messages.SUCCESS.UPDATED, { food });
});

const createVariant = catchAsync(async (req, res) => {
  const food = await Food.findById(req.params.id);
  if (!food) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  await ensureRestaurantAccess(food.restaurant, req.user);

  const variant = await FoodVariant.create({ ...req.body, food: food._id });
  food.variants.push(variant._id);
  await food.save();

  return sendCreated(res, messages.SUCCESS.CREATED, { variant });
});

const updateVariant = catchAsync(async (req, res) => {
  const variant = await FoodVariant.findById(req.params.variantId);
  if (!variant) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  const food = await Food.findById(variant.food);
  await ensureRestaurantAccess(food.restaurant, req.user);

  Object.assign(variant, req.body);
  await variant.save();

  return sendSuccess(res, messages.SUCCESS.UPDATED, { variant });
});

const deleteVariant = catchAsync(async (req, res) => {
  const variant = await FoodVariant.findById(req.params.variantId);
  if (!variant) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  const food = await Food.findById(variant.food);
  await ensureRestaurantAccess(food.restaurant, req.user);

  await variant.deleteOne();
  await Food.findByIdAndUpdate(food._id, { $pull: { variants: variant._id } });

  return sendSuccess(res, messages.SUCCESS.DELETED);
});

const createAddon = catchAsync(async (req, res) => {
  const food = await Food.findById(req.params.id);
  if (!food) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  await ensureRestaurantAccess(food.restaurant, req.user);

  const addon = await Addon.create({ ...req.body, food: food._id, restaurant: food.restaurant });
  food.addons.push(addon._id);
  await food.save();

  return sendCreated(res, messages.SUCCESS.CREATED, { addon });
});

const updateAddon = catchAsync(async (req, res) => {
  const addon = await Addon.findById(req.params.addonId);
  if (!addon) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  await ensureRestaurantAccess(addon.restaurant, req.user);

  Object.assign(addon, req.body);
  await addon.save();

  return sendSuccess(res, messages.SUCCESS.UPDATED, { addon });
});

const deleteAddon = catchAsync(async (req, res) => {
  const addon = await Addon.findById(req.params.addonId);
  if (!addon) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  await ensureRestaurantAccess(addon.restaurant, req.user);

  await addon.deleteOne();
  await Food.findByIdAndUpdate(addon.food, { $pull: { addons: addon._id } });

  return sendSuccess(res, messages.SUCCESS.DELETED);
});

module.exports = {
  createFood,
  listFoods,
  getFoodById,
  updateFood,
  deleteFood,
  toggleAvailability,
  createVariant,
  updateVariant,
  deleteVariant,
  createAddon,
  updateAddon,
  deleteAddon,
};
