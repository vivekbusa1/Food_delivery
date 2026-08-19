const Food = require('../models/Food');
const FoodVariant = require('../models/FoodVariant');
const Addon = require('../models/Addon');
const Restaurant = require('../models/Restaurant');
const Coupon = require('../models/Coupon');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const ApiError = require('../utils/ApiError');
const { generateOrderNumber } = require('../helpers/token');
const { ORDER_STATUS, PAYMENT_STATUS } = require('../constants/orderStatus');

const buildCartItemPricing = async (item) => {
  const food = await Food.findById(item.food);
  if (!food || !food.isActive) {
    throw ApiError.badRequest('One or more food items are unavailable');
  }

  let basePrice = food.discountPrice && food.discountPrice < food.price ? food.discountPrice : food.price;

  if (item.variant) {
    const variant = await FoodVariant.findOne({ _id: item.variant, food: food._id, isActive: true });
    if (!variant) throw ApiError.badRequest('Selected variant is not available');
    basePrice = variant.price;
  }

  let addonsTotal = 0;
  const addonDocs = [];
  if (item.addons && item.addons.length) {
    const addons = await Addon.find({ _id: { $in: item.addons }, food: food._id, isActive: true });
    if (addons.length !== item.addons.length) {
      throw ApiError.badRequest('One or more addons are not available');
    }
    addons.forEach((addon) => {
      addonsTotal += addon.price;
      addonDocs.push(addon);
    });
  }

  const unitPrice = basePrice + addonsTotal;
  const totalPrice = unitPrice * item.quantity;

  return { food, unitPrice, totalPrice, addonDocs };
};

const calculateCouponDiscount = (coupon, subTotal) => {
  if (subTotal < coupon.minOrderAmount) {
    throw ApiError.badRequest(`Minimum order amount for this coupon is ${coupon.minOrderAmount}`);
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (subTotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }
  } else {
    discount = coupon.discountValue;
  }

  return Math.min(discount, subTotal);
};

const validateCouponForUser = async (code, userId, restaurantId, subTotal) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

  if (!coupon) throw ApiError.badRequest('Invalid coupon code');

  const now = new Date();
  if (coupon.validFrom > now || coupon.validUntil < now) {
    throw ApiError.badRequest('Coupon has expired or is not yet active');
  }

  if (coupon.applicableTo === 'restaurant' && coupon.restaurant && coupon.restaurant.toString() !== restaurantId.toString()) {
    throw ApiError.badRequest('Coupon is not applicable to this restaurant');
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw ApiError.badRequest('Coupon usage limit has been reached');
  }

  const userUsage = coupon.usedBy.find((u) => u.user.toString() === userId.toString());
  if (userUsage && userUsage.count >= coupon.usageLimitPerUser) {
    throw ApiError.badRequest('You have already used this coupon the maximum number of times');
  }

  const discount = calculateCouponDiscount(coupon, subTotal);

  return { coupon, discount };
};

const recalculateCart = async (cart) => {
  let subTotal = 0;
  cart.items.forEach((item) => {
    subTotal += item.totalPrice;
  });

  let discount = 0;
  if (cart.coupon) {
    const coupon = await Coupon.findById(cart.coupon);
    if (coupon) {
      try {
        discount = calculateCouponDiscount(coupon, subTotal);
      } catch (err) {
        discount = 0;
        cart.coupon = null;
      }
    } else {
      cart.coupon = null;
    }
  }

  let deliveryFee = 0;
  let taxAmount = 0;

  if (cart.restaurant) {
    const restaurant = await Restaurant.findById(cart.restaurant);
    if (restaurant) {
      deliveryFee = restaurant.deliveryFee || 0;
      if (restaurant.freeDeliveryAbove && subTotal >= restaurant.freeDeliveryAbove) {
        deliveryFee = 0;
      }
      taxAmount = Math.round(((subTotal - discount) * (restaurant.taxPercent || 0)) / 100 * 100) / 100;
    }
  }

  cart.subTotal = Math.round(subTotal * 100) / 100;
  cart.discount = Math.round(discount * 100) / 100;
  cart.deliveryFee = deliveryFee;
  cart.taxAmount = taxAmount;
  cart.total = Math.round((cart.subTotal - cart.discount + cart.deliveryFee + cart.taxAmount) * 100) / 100;

  return cart;
};

const createOrderFromCart = async ({ user, cart, deliveryAddress, paymentMethod, specialInstructions, tipAmount = 0 }) => {
  if (!cart || !cart.items.length) {
    throw ApiError.badRequest('Cart is empty');
  }

  const restaurant = await Restaurant.findById(cart.restaurant);
  if (!restaurant || !restaurant.isActive || !restaurant.isApproved) {
    throw ApiError.badRequest('Restaurant is not available for orders');
  }
  if (!restaurant.isOpen) {
    throw ApiError.badRequest('Restaurant is currently closed');
  }
  if (cart.subTotal < restaurant.minOrderAmount) {
    throw ApiError.badRequest(`Minimum order amount is ${restaurant.minOrderAmount}`);
  }

  // Avoid multi-document transactions — they require a replica set / mongos and fail on
  // the standalone MongoDB typically used in local Docker development.
  const orderNumber = generateOrderNumber();
  const total = Math.round((cart.total + Number(tipAmount || 0)) * 100) / 100;

  const order = await Order.create({
    orderNumber,
    user: user._id,
    restaurant: restaurant._id,
    items: [],
    deliveryAddress,
    coupon: cart.coupon || null,
    subTotal: cart.subTotal,
    discount: cart.discount,
    deliveryFee: cart.deliveryFee,
    packagingCharge: restaurant.packagingCharge || 0,
    taxAmount: cart.taxAmount,
    tipAmount: tipAmount || 0,
    total,
    paymentMethod,
    paymentStatus: PAYMENT_STATUS.PENDING,
    status: ORDER_STATUS.PENDING,
    statusHistory: [{ status: ORDER_STATUS.PENDING, changedBy: user._id }],
    specialInstructions: specialInstructions || '',
  });

  const foodIds = cart.items.map((item) => item.food);
  const foodDocs = await Food.find({ _id: { $in: foodIds } });
  const foodMap = new Map(foodDocs.map((f) => [f._id.toString(), f]));

  const variantIds = cart.items.filter((i) => i.variant).map((i) => i.variant);
  const variantDocs = variantIds.length ? await FoodVariant.find({ _id: { $in: variantIds } }) : [];
  const variantMap = new Map(variantDocs.map((v) => [v._id.toString(), v]));

  const addonIds = cart.items.flatMap((i) => i.addons || []);
  const addonDocs = addonIds.length ? await Addon.find({ _id: { $in: addonIds } }) : [];
  const addonMap = new Map(addonDocs.map((a) => [a._id.toString(), a]));

  const orderItemDocs = await OrderItem.insertMany(
    cart.items.map((item) => {
      const food = foodMap.get(item.food.toString());
      const variant = item.variant ? variantMap.get(item.variant.toString()) : null;
      const addons = (item.addons || [])
        .map((addonId) => addonMap.get(addonId.toString()))
        .filter(Boolean)
        .map((addon) => ({ addonId: addon._id, name: addon.name, price: addon.price }));

      return {
        order: order._id,
        food: item.food,
        name: food ? food.name : 'Item',
        image: food && food.images && food.images[0] ? food.images[0].url : '',
        variant: variant ? { variantId: variant._id, name: variant.name, price: variant.price } : undefined,
        addons,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.totalPrice,
        specialInstructions: item.specialInstructions || '',
      };
    }),
  );

  order.items = orderItemDocs.map((i) => i._id);
  await order.save();

  if (cart.coupon) {
    const coupon = await Coupon.findById(cart.coupon);
    if (coupon) {
      const existingUsage = coupon.usedBy.find((u) => u.user.toString() === user._id.toString());
      if (existingUsage) {
        existingUsage.count += 1;
      } else {
        coupon.usedBy.push({ user: user._id, count: 1 });
      }
      coupon.usedCount += 1;
      await coupon.save();
    }
  }

  for (const item of cart.items) {
    await Food.updateOne({ _id: item.food }, { $inc: { totalOrders: item.quantity } });
  }

  cart.items = [];
  cart.restaurant = null;
  cart.coupon = null;
  cart.subTotal = 0;
  cart.discount = 0;
  cart.deliveryFee = 0;
  cart.taxAmount = 0;
  cart.total = 0;
  await cart.save();

  return Order.findById(order._id).populate('items').populate('restaurant').populate('user');
};

module.exports = {
  buildCartItemPricing,
  calculateCouponDiscount,
  validateCouponForUser,
  recalculateCart,
  createOrderFromCart,
};
