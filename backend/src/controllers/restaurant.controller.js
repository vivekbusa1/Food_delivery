const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { sendSuccess, sendCreated } = require('../helpers/response');
const messages = require('../constants/messages');
const { paginate } = require('../helpers/pagination');
const Restaurant = require('../models/Restaurant');
const RestaurantTiming = require('../models/RestaurantTiming');
const RestaurantGallery = require('../models/RestaurantGallery');
const User = require('../models/User');
const uploadService = require('../services/upload.service');
const { ROLES } = require('../constants/roles');

const createRestaurant = catchAsync(async (req, res) => {
  const ownerId = req.user.role === ROLES.ADMIN && req.body.owner ? req.body.owner : req.user._id;

  const restaurant = await Restaurant.create({
    ...req.body,
    owner: ownerId,
    isApproved: req.user.role === ROLES.ADMIN,
    approvalStatus: req.user.role === ROLES.ADMIN ? 'approved' : 'pending',
  });

  await User.findByIdAndUpdate(ownerId, { restaurant: restaurant._id, role: ROLES.RESTAURANT });

  return sendCreated(res, messages.SUCCESS.CREATED, { restaurant });
});

const listRestaurants = catchAsync(async (req, res) => {
  const filter = {};

  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }
  if (req.query.category) filter.categories = req.query.category;
  if (req.query.cuisine) filter.cuisines = req.query.cuisine;
  if (req.query.isVeg !== undefined) filter.isVeg = req.query.isVeg === 'true';
  if (req.query.isFeatured !== undefined) filter.isFeatured = req.query.isFeatured === 'true';

  if (req.user && req.user.role === ROLES.ADMIN) {
    if (req.query.approvalStatus) filter.approvalStatus = req.query.approvalStatus;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
  } else {
    filter.isApproved = true;
    filter.isActive = true;
  }

  const { data, meta } = await paginate(Restaurant, filter, {
    ...req.query,
    populate: [
      { path: 'categories' },
      { path: 'owner', select: 'name email phone' },
    ],
  });

  return sendSuccess(res, messages.SUCCESS.FETCHED, data, meta);
});

const nearbyRestaurants = catchAsync(async (req, res) => {
  const { lng, lat, radius = 5 } = req.query;

  const filter = {
    isApproved: true,
    isActive: true,
    location: {
      $nearSphere: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: parseFloat(radius) * 1000,
      },
    },
  };

  const { data, meta } = await paginate(Restaurant, filter, req.query);
  return sendSuccess(res, messages.SUCCESS.FETCHED, data, meta);
});

const getRestaurantById = catchAsync(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id).populate('categories');
  if (!restaurant) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  const timings = await RestaurantTiming.find({ restaurant: restaurant._id });
  const gallery = await RestaurantGallery.find({ restaurant: restaurant._id }).sort({ order: 1 });

  return sendSuccess(res, messages.SUCCESS.FETCHED, { restaurant, timings, gallery });
});

const ensureRestaurantAccess = (restaurant, user) => {
  if (user.role === ROLES.ADMIN) return;
  if (restaurant.owner.toString() !== user._id.toString()) {
    throw ApiError.forbidden(messages.ERROR.FORBIDDEN);
  }
};

const updateRestaurant = catchAsync(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  ensureRestaurantAccess(restaurant, req.user);

  const restrictedFields = ['owner', 'isApproved', 'approvalStatus', 'ratingsAverage', 'ratingsCount'];
  restrictedFields.forEach((field) => delete req.body[field]);

  Object.assign(restaurant, req.body);
  await restaurant.save();

  return sendSuccess(res, messages.SUCCESS.UPDATED, { restaurant });
});

const deleteRestaurant = catchAsync(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  ensureRestaurantAccess(restaurant, req.user);

  restaurant.isActive = false;
  await restaurant.save();

  return sendSuccess(res, messages.SUCCESS.DELETED);
});

const updateLogo = catchAsync(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Logo image is required');

  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) throw ApiError.notFound(messages.ERROR.NOT_FOUND);
  ensureRestaurantAccess(restaurant, req.user);

  if (restaurant.logo?.publicId) await uploadService.deleteFromCloudinary(restaurant.logo.publicId);
  restaurant.logo = uploadService.mapUploadedFile(req.file);
  await restaurant.save();

  return sendSuccess(res, messages.SUCCESS.UPDATED, { restaurant });
});

const updateCover = catchAsync(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Cover image is required');

  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) throw ApiError.notFound(messages.ERROR.NOT_FOUND);
  ensureRestaurantAccess(restaurant, req.user);

  if (restaurant.coverImage?.publicId) await uploadService.deleteFromCloudinary(restaurant.coverImage.publicId);
  restaurant.coverImage = uploadService.mapUploadedFile(req.file);
  await restaurant.save();

  return sendSuccess(res, messages.SUCCESS.UPDATED, { restaurant });
});

const approveRestaurant = catchAsync(async (req, res) => {
  const { approvalStatus, rejectionReason } = req.body;

  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  restaurant.approvalStatus = approvalStatus;
  restaurant.isApproved = approvalStatus === 'approved';
  restaurant.rejectionReason = approvalStatus === 'rejected' ? rejectionReason || '' : '';
  await restaurant.save();

  return sendSuccess(res, messages.SUCCESS.UPDATED, { restaurant });
});

const toggleOpenStatus = catchAsync(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) throw ApiError.notFound(messages.ERROR.NOT_FOUND);
  ensureRestaurantAccess(restaurant, req.user);

  restaurant.isOpen = !restaurant.isOpen;
  await restaurant.save();

  return sendSuccess(res, messages.SUCCESS.UPDATED, { restaurant });
});

const upsertTiming = catchAsync(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) throw ApiError.notFound(messages.ERROR.NOT_FOUND);
  ensureRestaurantAccess(restaurant, req.user);

  const { day, isOpen, openTime, closeTime } = req.body;

  const timing = await RestaurantTiming.findOneAndUpdate(
    { restaurant: restaurant._id, day },
    { isOpen, openTime, closeTime },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );

  return sendSuccess(res, messages.SUCCESS.UPDATED, { timing });
});

const getTimings = catchAsync(async (req, res) => {
  const timings = await RestaurantTiming.find({ restaurant: req.params.id }).sort({ day: 1 });
  return sendSuccess(res, messages.SUCCESS.FETCHED, { timings });
});

const addGalleryImage = catchAsync(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Image is required');

  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) throw ApiError.notFound(messages.ERROR.NOT_FOUND);
  ensureRestaurantAccess(restaurant, req.user);

  const image = uploadService.mapUploadedFile(req.file);
  const galleryItem = await RestaurantGallery.create({
    restaurant: restaurant._id,
    image,
    caption: req.body.caption || '',
  });

  return sendCreated(res, messages.SUCCESS.CREATED, { galleryItem });
});

const deleteGalleryImage = catchAsync(async (req, res) => {
  const galleryItem = await RestaurantGallery.findById(req.params.imageId);
  if (!galleryItem) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  const restaurant = await Restaurant.findById(galleryItem.restaurant);
  ensureRestaurantAccess(restaurant, req.user);

  if (galleryItem.image?.publicId) await uploadService.deleteFromCloudinary(galleryItem.image.publicId);
  await galleryItem.deleteOne();

  return sendSuccess(res, messages.SUCCESS.DELETED);
});

const getMyRestaurant = catchAsync(async (req, res) => {
  let restaurant = await Restaurant.findOne({ owner: req.user._id });

  // Restaurant-role users must always have a restaurant record so the panel
  // can load profile/orders/menu. Auto-create a pending shell if missing.
  if (!restaurant) {
    restaurant = await Restaurant.create({
      owner: req.user._id,
      name: req.user.name || 'My Restaurant',
      email: req.user.email || undefined,
      phone: req.user.phone || undefined,
      approvalStatus: 'pending',
      isApproved: false,
      isOpen: false,
    });
    await User.findByIdAndUpdate(req.user._id, {
      restaurant: restaurant._id,
      role: ROLES.RESTAURANT,
    });
  }

  return sendSuccess(res, messages.SUCCESS.FETCHED, { restaurant });
});

module.exports = {
  createRestaurant,
  listRestaurants,
  nearbyRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  updateLogo,
  updateCover,
  approveRestaurant,
  toggleOpenStatus,
  upsertTiming,
  getTimings,
  addGalleryImage,
  deleteGalleryImage,
  getMyRestaurant,
};
