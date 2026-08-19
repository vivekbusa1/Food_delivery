const express = require('express');
const adminController = require('../controllers/admin.controller');
const userController = require('../controllers/user.controller');
const restaurantController = require('../controllers/restaurant.controller');
const validators = require('../validators/restaurant.validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/analytics/revenue', adminController.getRevenueAnalytics);
router.get('/analytics/orders', adminController.getOrderAnalytics);
router.get('/analytics/top-restaurants', adminController.getTopRestaurants);
router.get('/analytics/top-foods', adminController.getTopFoods);

router.get('/orders', adminController.listOrders);
router.get('/payments', adminController.listPayments);

router.get('/users', userController.listUsers);
router.get('/users/:id', userController.getUserById);
router.patch('/users/:id/status', userController.updateUserStatus);
router.patch('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', userController.deleteUser);

router.get('/restaurants', restaurantController.listRestaurants);
router.patch(
  '/restaurants/:id/approve',
  validators.approveRestaurant,
  validate,
  restaurantController.approveRestaurant,
);

router.get('/roles', adminController.getAvailableRoles);

router.get('/cms', adminController.listCmsPages);
router.get('/cms/:slug', adminController.getCmsPage);
router.put('/cms/:slug', adminController.upsertCmsPage);

router.get('/logs', adminController.getLogs);

module.exports = router;
