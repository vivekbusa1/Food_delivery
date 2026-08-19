const fs = require('fs');
const path = require('path');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../helpers/response');
const messages = require('../constants/messages');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const Food = require('../models/Food');
const DeliveryPartner = require('../models/DeliveryPartner');
const Payment = require('../models/Payment');
const Setting = require('../models/Setting');
const { ROLES, ALL_ROLES } = require('../constants/roles');
const { ORDER_STATUS, PAYMENT_STATUS } = require('../constants/orderStatus');
const { paginate } = require('../helpers/pagination');

const getDashboardStats = catchAsync(async (req, res) => {
  const [
    totalUsers,
    totalCustomers,
    totalRestaurants,
    pendingRestaurants,
    totalDeliveryPartners,
    pendingDeliveryPartners,
    totalOrders,
    ordersToday,
    revenueAgg,
    activeOrders,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: ROLES.CUSTOMER }),
    Restaurant.countDocuments(),
    Restaurant.countDocuments({ approvalStatus: 'pending' }),
    DeliveryPartner.countDocuments(),
    DeliveryPartner.countDocuments({ approvalStatus: 'pending' }),
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
    Payment.aggregate([
      { $match: { status: PAYMENT_STATUS.PAID } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Order.countDocuments({
      status: { $nin: [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED, ORDER_STATUS.REJECTED] },
    }),
  ]);

  return sendSuccess(res, messages.SUCCESS.FETCHED, {
    users: { total: totalUsers, customers: totalCustomers },
    restaurants: { total: totalRestaurants, pendingApproval: pendingRestaurants },
    deliveryPartners: { total: totalDeliveryPartners, pendingApproval: pendingDeliveryPartners },
    orders: { total: totalOrders, today: ordersToday, active: activeOrders },
    revenue: { total: revenueAgg[0]?.total || 0 },
  });
});

const getRevenueAnalytics = catchAsync(async (req, res) => {
  const { from, to, groupBy = 'day' } = req.query;

  const match = { status: PAYMENT_STATUS.PAID };
  if (from || to) {
    match.createdAt = {};
    if (from) match.createdAt.$gte = new Date(from);
    if (to) match.createdAt.$lte = new Date(to);
  }

  const dateFormat = groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d';

  const revenueByDate = await Payment.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return sendSuccess(res, messages.SUCCESS.FETCHED, { revenueByDate });
});

const getOrderAnalytics = catchAsync(async (req, res) => {
  const statusBreakdown = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const paymentMethodBreakdown = await Order.aggregate([
    { $group: { _id: '$paymentMethod', count: { $sum: 1 } } },
  ]);

  return sendSuccess(res, messages.SUCCESS.FETCHED, { statusBreakdown, paymentMethodBreakdown });
});

const getTopRestaurants = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;

  const topRestaurants = await Order.aggregate([
    { $match: { status: ORDER_STATUS.DELIVERED } },
    { $group: { _id: '$restaurant', totalOrders: { $sum: 1 }, totalRevenue: { $sum: '$total' } } },
    { $sort: { totalOrders: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'restaurants',
        localField: '_id',
        foreignField: '_id',
        as: 'restaurant',
      },
    },
    { $unwind: '$restaurant' },
    {
      $project: {
        totalOrders: 1,
        totalRevenue: 1,
        'restaurant.name': 1,
        'restaurant.logo': 1,
        'restaurant.ratingsAverage': 1,
      },
    },
  ]);

  return sendSuccess(res, messages.SUCCESS.FETCHED, { topRestaurants });
});

const getTopFoods = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;

  const topFoods = await Food.find({ isActive: true })
    .sort({ totalOrders: -1 })
    .limit(limit)
    .select('name images totalOrders ratingsAverage price');

  return sendSuccess(res, messages.SUCCESS.FETCHED, { topFoods });
});

const updateUserRole = catchAsync(async (req, res) => {
  const { role } = req.body;

  if (!ALL_ROLES.includes(role)) {
    throw ApiError.badRequest('Invalid role');
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  return sendSuccess(res, messages.SUCCESS.UPDATED, { user: user.toSafeObject() });
});

const getAvailableRoles = catchAsync(async (req, res) => {
  return sendSuccess(res, messages.SUCCESS.FETCHED, { roles: ALL_ROLES });
});

const getCmsPage = catchAsync(async (req, res) => {
  const setting = await Setting.findOne({ key: `cms_${req.params.slug}` });
  if (!setting) throw ApiError.notFound('CMS page not found');

  return sendSuccess(res, messages.SUCCESS.FETCHED, { page: setting });
});

const upsertCmsPage = catchAsync(async (req, res) => {
  const { slug } = req.params;
  const { title, content } = req.body;

  const setting = await Setting.findOneAndUpdate(
    { key: `cms_${slug}` },
    {
      value: { title, content, slug },
      group: 'seo',
      description: `CMS page: ${slug}`,
      isPublic: true,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  return sendSuccess(res, messages.SUCCESS.UPDATED, { page: setting });
});

const listCmsPages = catchAsync(async (req, res) => {
  const pages = await Setting.find({ key: { $regex: '^cms_' } });
  return sendSuccess(res, messages.SUCCESS.FETCHED, { pages });
});

const getLogs = catchAsync(async (req, res) => {
  const level = req.query.level === 'error' ? 'error.log' : 'combined.log';
  const logPath = path.join(__dirname, '..', '..', 'logs', level);

  if (!fs.existsSync(logPath)) {
    return sendSuccess(res, messages.SUCCESS.FETCHED, { logs: [] });
  }

  const content = fs.readFileSync(logPath, 'utf-8');
  const lines = content.split('\n').filter(Boolean);
  const limit = parseInt(req.query.limit, 10) || 200;
  const recentLines = lines.slice(-limit).reverse();

  const logs = recentLines.map((line) => {
    try {
      return JSON.parse(line);
    } catch (err) {
      return { message: line };
    }
  });

  return sendSuccess(res, messages.SUCCESS.FETCHED, { logs });
});

const listOrders = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
  if (req.query.search) {
    filter.$or = [
      { orderNumber: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const { data, meta } = await paginate(Order, filter, {
    ...req.query,
    populate: [
      { path: 'restaurant', select: 'name logo' },
      { path: 'user', select: 'name phone email' },
      { path: 'deliveryPartner', select: 'user vehicleType', populate: { path: 'user', select: 'name phone' } },
      { path: 'items' },
    ],
  });

  return sendSuccess(res, messages.SUCCESS.FETCHED, data, meta);
});

const listPayments = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.method) filter.method = req.query.method;

  const { data, meta } = await paginate(Payment, filter, {
    ...req.query,
    populate: [
      { path: 'order', select: 'orderNumber total' },
      { path: 'user', select: 'name email phone' },
    ],
  });

  return sendSuccess(res, messages.SUCCESS.FETCHED, data, meta);
});

module.exports = {
  getDashboardStats,
  getRevenueAnalytics,
  getOrderAnalytics,
  getTopRestaurants,
  getTopFoods,
  updateUserRole,
  getAvailableRoles,
  getCmsPage,
  upsertCmsPage,
  listCmsPages,
  getLogs,
  listOrders,
  listPayments,
};
