const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { sendSuccess, sendCreated } = require('../helpers/response');
const messages = require('../constants/messages');
const Banner = require('../models/Banner');
const Offer = require('../models/Offer');
const Restaurant = require('../models/Restaurant');
const uploadService = require('../services/upload.service');
const { ROLES } = require('../constants/roles');

const createBanner = catchAsync(async (req, res) => {
  const image = req.file ? uploadService.mapUploadedFile(req.file) : req.body.image;
  if (!image || !image.url) throw ApiError.badRequest('Banner image is required');

  const banner = await Banner.create({ ...req.body, image });
  return sendCreated(res, messages.SUCCESS.CREATED, { banner });
});

const listBanners = catchAsync(async (req, res) => {
  const now = new Date();
  const filter = {
    isActive: true,
    startDate: { $lte: now },
    $or: [{ endDate: null }, { endDate: { $gte: now } }],
  };
  if (req.query.position) filter.position = req.query.position;

  const banners = await Banner.find(filter).sort({ order: 1, createdAt: -1 });
  return sendSuccess(res, messages.SUCCESS.FETCHED, { banners });
});

const listAllBanners = catchAsync(async (req, res) => {
  const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
  return sendSuccess(res, messages.SUCCESS.FETCHED, { banners });
});

const updateBanner = catchAsync(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  if (req.file) {
    if (banner.image?.publicId) await uploadService.deleteFromCloudinary(banner.image.publicId);
    req.body.image = uploadService.mapUploadedFile(req.file);
  }

  Object.assign(banner, req.body);
  await banner.save();

  return sendSuccess(res, messages.SUCCESS.UPDATED, { banner });
});

const deleteBanner = catchAsync(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  if (banner.image?.publicId) await uploadService.deleteFromCloudinary(banner.image.publicId);
  await banner.deleteOne();

  return sendSuccess(res, messages.SUCCESS.DELETED);
});

const createOffer = catchAsync(async (req, res) => {
  const image = req.file ? uploadService.mapUploadedFile(req.file) : req.body.image;
  const offer = await Offer.create({ ...req.body, image });
  return sendCreated(res, messages.SUCCESS.CREATED, { offer });
});

const listOffers = catchAsync(async (req, res) => {
  const now = new Date();
  const filter = { isActive: true, validFrom: { $lte: now }, validUntil: { $gte: now } };
  if (req.query.restaurant) filter.restaurant = req.query.restaurant;

  const offers = await Offer.find(filter).populate('restaurant', 'name logo').populate('food', 'name images');
  return sendSuccess(res, messages.SUCCESS.FETCHED, { offers });
});

const listAllOffers = catchAsync(async (req, res) => {
  const offers = await Offer.find().sort({ createdAt: -1 });
  return sendSuccess(res, messages.SUCCESS.FETCHED, { offers });
});

const listMyOffers = catchAsync(async (req, res) => {
  const filter = {};

  if (req.user.role === ROLES.ADMIN) {
    if (req.query.restaurant) filter.restaurant = req.query.restaurant;
  } else {
    const restaurant = await Restaurant.findOne({ owner: req.user._id }).select('_id');
    if (!restaurant) {
      return sendSuccess(res, messages.SUCCESS.FETCHED, { offers: [] });
    }
    filter.restaurant = restaurant._id;
  }

  const offers = await Offer.find(filter).sort({ createdAt: -1 });
  return sendSuccess(res, messages.SUCCESS.FETCHED, { offers });
});

const updateOffer = catchAsync(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  if (req.file) {
    if (offer.image?.publicId) await uploadService.deleteFromCloudinary(offer.image.publicId);
    req.body.image = uploadService.mapUploadedFile(req.file);
  }

  Object.assign(offer, req.body);
  await offer.save();

  return sendSuccess(res, messages.SUCCESS.UPDATED, { offer });
});

const deleteOffer = catchAsync(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  await offer.deleteOne();
  return sendSuccess(res, messages.SUCCESS.DELETED);
});

module.exports = {
  createBanner,
  listBanners,
  listAllBanners,
  updateBanner,
  deleteBanner,
  createOffer,
  listOffers,
  listAllOffers,
  listMyOffers,
  updateOffer,
  deleteOffer,
};
