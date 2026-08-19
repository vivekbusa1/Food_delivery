const express = require('express');

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const restaurantRoutes = require('./restaurant.routes');
const foodRoutes = require('./food.routes');
const categoryRoutes = require('./category.routes');
const cartRoutes = require('./cart.routes');
const orderRoutes = require('./order.routes');
const addressRoutes = require('./address.routes');
const wishlistRoutes = require('./wishlist.routes');
const favoriteRoutes = require('./favorite.routes');
const couponRoutes = require('./coupon.routes');
const reviewRoutes = require('./review.routes');
const paymentRoutes = require('./payment.routes');
const bannerRoutes = require('./banner.routes');
const offerRoutes = require('./offer.routes');
const notificationRoutes = require('./notification.routes');
const deliveryRoutes = require('./delivery.routes');
const adminRoutes = require('./admin.routes');
const uploadRoutes = require('./upload.routes');
const settingRoutes = require('./setting.routes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy', data: { timestamp: new Date() } });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/foods', foodRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/addresses', addressRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/coupons', couponRoutes);
router.use('/reviews', reviewRoutes);
router.use('/payments', paymentRoutes);
router.use('/banners', bannerRoutes);
router.use('/offers', offerRoutes);
router.use('/notifications', notificationRoutes);
router.use('/delivery', deliveryRoutes);
router.use('/admin', adminRoutes);
router.use('/uploads', uploadRoutes);
router.use('/settings', settingRoutes);

module.exports = router;
