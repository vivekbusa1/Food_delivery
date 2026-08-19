const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../helpers/response');
const messages = require('../constants/messages');
const Cart = require('../models/Cart');
const Food = require('../models/Food');
const orderService = require('../services/order.service');

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

const populateCart = (cart) =>
  cart.populate([
    { path: 'items.food', select: 'name images price discountPrice isAvailable' },
    { path: 'items.variant', select: 'name price' },
    { path: 'items.addons', select: 'name price' },
    { path: 'restaurant', select: 'name logo isOpen deliveryFee minOrderAmount' },
    { path: 'coupon', select: 'code discountType discountValue' },
  ]);

const getCart = catchAsync(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  await populateCart(cart);
  return sendSuccess(res, messages.SUCCESS.FETCHED, { cart });
});

const addToCart = catchAsync(async (req, res) => {
  const { food: foodId, variant, addons = [], quantity = 1, specialInstructions = '' } = req.body;

  const food = await Food.findById(foodId);
  if (!food || !food.isActive || !food.isAvailable) {
    throw ApiError.badRequest('Food item is not available');
  }

  const cart = await getOrCreateCart(req.user._id);

  if (cart.restaurant && cart.restaurant.toString() !== food.restaurant.toString()) {
    throw ApiError.badRequest(
      'Your cart contains items from another restaurant. Clear cart to add items from a different restaurant.',
    );
  }

  const { unitPrice, totalPrice } = await orderService.buildCartItemPricing({
    food: foodId,
    variant,
    addons,
    quantity,
  });

  const existingItemIndex = cart.items.findIndex(
    (item) =>
      item.food.toString() === foodId &&
      (item.variant ? item.variant.toString() : null) === (variant || null) &&
      JSON.stringify((item.addons || []).map(String).sort()) === JSON.stringify((addons || []).map(String).sort()),
  );

  if (existingItemIndex > -1) {
    const existingItem = cart.items[existingItemIndex];
    existingItem.quantity += quantity;
    existingItem.totalPrice = existingItem.price * existingItem.quantity;
  } else {
    cart.items.push({
      food: foodId,
      variant: variant || null,
      addons,
      quantity,
      price: unitPrice,
      totalPrice,
      specialInstructions,
    });
  }

  cart.restaurant = food.restaurant;
  await orderService.recalculateCart(cart);
  await cart.save();
  await populateCart(cart);

  return sendSuccess(res, messages.SUCCESS.UPDATED, { cart });
});

const updateCartItem = catchAsync(async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw ApiError.notFound('Cart not found');

  const item = cart.items.id(itemId);
  if (!item) throw ApiError.notFound('Cart item not found');

  item.quantity = quantity;
  item.totalPrice = item.price * quantity;

  await orderService.recalculateCart(cart);
  await cart.save();
  await populateCart(cart);

  return sendSuccess(res, messages.SUCCESS.UPDATED, { cart });
});

const removeCartItem = catchAsync(async (req, res) => {
  const { itemId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw ApiError.notFound('Cart not found');

  cart.items = cart.items.filter((item) => item._id.toString() !== itemId);

  if (cart.items.length === 0) {
    cart.restaurant = null;
    cart.coupon = null;
  }

  await orderService.recalculateCart(cart);
  await cart.save();
  await populateCart(cart);

  return sendSuccess(res, messages.SUCCESS.UPDATED, { cart });
});

const clearCart = catchAsync(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);

  cart.items = [];
  cart.restaurant = null;
  cart.coupon = null;
  cart.subTotal = 0;
  cart.discount = 0;
  cart.deliveryFee = 0;
  cart.taxAmount = 0;
  cart.total = 0;
  await cart.save();

  return sendSuccess(res, messages.SUCCESS.UPDATED, { cart });
});

const applyCoupon = catchAsync(async (req, res) => {
  const { code } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || !cart.items.length) throw ApiError.badRequest('Cart is empty');

  const { coupon } = await orderService.validateCouponForUser(
    code,
    req.user._id,
    cart.restaurant,
    cart.subTotal,
  );

  cart.coupon = coupon._id;
  await orderService.recalculateCart(cart);
  await cart.save();
  await populateCart(cart);

  return sendSuccess(res, messages.SUCCESS.UPDATED, { cart });
});

const removeCoupon = catchAsync(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw ApiError.notFound('Cart not found');

  cart.coupon = null;
  await orderService.recalculateCart(cart);
  await cart.save();
  await populateCart(cart);

  return sendSuccess(res, messages.SUCCESS.UPDATED, { cart });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  applyCoupon,
  removeCoupon,
};
