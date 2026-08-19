const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { sendSuccess, sendCreated } = require('../helpers/response');
const messages = require('../constants/messages');
const FoodCategory = require('../models/FoodCategory');
const RestaurantCategory = require('../models/RestaurantCategory');
const Restaurant = require('../models/Restaurant');
const uploadService = require('../services/upload.service');
const { ROLES } = require('../constants/roles');

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

// ---------- Food Categories ----------

const createFoodCategory = catchAsync(async (req, res) => {
  if (req.body.restaurant) {
    const restaurant = await Restaurant.findById(req.body.restaurant);
    if (!restaurant) throw ApiError.notFound('Restaurant not found');
    if (req.user.role !== ROLES.ADMIN && restaurant.owner.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden(messages.ERROR.FORBIDDEN);
    }
  }

  const image = req.file ? uploadService.mapUploadedFile(req.file) : undefined;

  const category = await FoodCategory.create({
    ...req.body,
    slug: slugify(req.body.name),
    image,
  });

  return sendCreated(res, messages.SUCCESS.CREATED, { category });
});

const listFoodCategories = catchAsync(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.restaurant) filter.restaurant = req.query.restaurant;
  if (req.query.isGlobal !== undefined) filter.isGlobal = req.query.isGlobal === 'true';

  const categories = await FoodCategory.find(filter).sort({ order: 1, createdAt: -1 });
  return sendSuccess(res, messages.SUCCESS.FETCHED, { categories });
});

const getFoodCategoryById = catchAsync(async (req, res) => {
  const category = await FoodCategory.findById(req.params.id);
  if (!category) throw ApiError.notFound(messages.ERROR.NOT_FOUND);
  return sendSuccess(res, messages.SUCCESS.FETCHED, { category });
});

const updateFoodCategory = catchAsync(async (req, res) => {
  const category = await FoodCategory.findById(req.params.id);
  if (!category) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  if (req.file) {
    if (category.image?.publicId) await uploadService.deleteFromCloudinary(category.image.publicId);
    req.body.image = uploadService.mapUploadedFile(req.file);
  }
  if (req.body.name) req.body.slug = slugify(req.body.name);

  Object.assign(category, req.body);
  await category.save();

  return sendSuccess(res, messages.SUCCESS.UPDATED, { category });
});

const deleteFoodCategory = catchAsync(async (req, res) => {
  const category = await FoodCategory.findById(req.params.id);
  if (!category) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  category.isActive = false;
  await category.save();

  return sendSuccess(res, messages.SUCCESS.DELETED);
});

// ---------- Restaurant Categories ----------

const createRestaurantCategory = catchAsync(async (req, res) => {
  const image = req.file ? uploadService.mapUploadedFile(req.file) : undefined;

  const category = await RestaurantCategory.create({
    ...req.body,
    slug: slugify(req.body.name),
    image,
  });

  return sendCreated(res, messages.SUCCESS.CREATED, { category });
});

const listRestaurantCategories = catchAsync(async (req, res) => {
  const filter = { isActive: true };
  const categories = await RestaurantCategory.find(filter).sort({ order: 1, createdAt: -1 });
  return sendSuccess(res, messages.SUCCESS.FETCHED, { categories });
});

const updateRestaurantCategory = catchAsync(async (req, res) => {
  const category = await RestaurantCategory.findById(req.params.id);
  if (!category) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  if (req.file) {
    if (category.image?.publicId) await uploadService.deleteFromCloudinary(category.image.publicId);
    req.body.image = uploadService.mapUploadedFile(req.file);
  }
  if (req.body.name) req.body.slug = slugify(req.body.name);

  Object.assign(category, req.body);
  await category.save();

  return sendSuccess(res, messages.SUCCESS.UPDATED, { category });
});

const deleteRestaurantCategory = catchAsync(async (req, res) => {
  const category = await RestaurantCategory.findById(req.params.id);
  if (!category) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  category.isActive = false;
  await category.save();

  return sendSuccess(res, messages.SUCCESS.DELETED);
});

// ---------- Cuisines ----------

const listCuisines = catchAsync(async (req, res) => {
  const cuisines = await Restaurant.distinct('cuisines', { isActive: true, isApproved: true });
  return sendSuccess(res, messages.SUCCESS.FETCHED, { cuisines: cuisines.filter(Boolean) });
});

module.exports = {
  createFoodCategory,
  listFoodCategories,
  getFoodCategoryById,
  updateFoodCategory,
  deleteFoodCategory,
  createRestaurantCategory,
  listRestaurantCategories,
  updateRestaurantCategory,
  deleteRestaurantCategory,
  listCuisines,
};
