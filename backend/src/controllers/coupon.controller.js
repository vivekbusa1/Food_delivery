const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { sendSuccess, sendCreated } = require('../helpers/response');
const messages = require('../constants/messages');
const { paginate } = require('../helpers/pagination');
const Coupon = require('../models/Coupon');
const orderService = require('../services/order.service');

const createCoupon = catchAsync(async (req, res) => {
  const coupon = await Coupon.create({ ...req.body, createdBy: req.user._id });
  return sendCreated(res, messages.SUCCESS.CREATED, { coupon });
});

const listCoupons = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.restaurant) filter.restaurant = req.query.restaurant;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

  const { data, meta } = await paginate(Coupon, filter, req.query);
  return sendSuccess(res, messages.SUCCESS.FETCHED, data, meta);
});

const listActiveCoupons = catchAsync(async (req, res) => {
  const now = new Date();
  const filter = {
    isActive: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now },
  };
  if (req.query.restaurant) {
    filter.$or = [{ restaurant: req.query.restaurant }, { restaurant: null }];
  }

  const coupons = await Coupon.find(filter).select('-usedBy');
  return sendSuccess(res, messages.SUCCESS.FETCHED, { coupons });
});

const getCouponById = catchAsync(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw ApiError.notFound(messages.ERROR.NOT_FOUND);
  return sendSuccess(res, messages.SUCCESS.FETCHED, { coupon });
});

const updateCoupon = catchAsync(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  Object.assign(coupon, req.body);
  await coupon.save();

  return sendSuccess(res, messages.SUCCESS.UPDATED, { coupon });
});

const deleteCoupon = catchAsync(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  coupon.isActive = false;
  await coupon.save();

  return sendSuccess(res, messages.SUCCESS.DELETED);
});

const validateCoupon = catchAsync(async (req, res) => {
  const { code, restaurantId, subTotal } = req.body;

  const { coupon, discount } = await orderService.validateCouponForUser(
    code,
    req.user._id,
    restaurantId,
    subTotal,
  );

  return sendSuccess(res, 'Coupon is valid', {
    coupon: {
      id: coupon._id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    },
    discount,
    finalAmount: Math.round((subTotal - discount) * 100) / 100,
  });
});

module.exports = {
  createCoupon,
  listCoupons,
  listActiveCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
};
