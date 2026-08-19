const express = require('express');
const deliveryController = require('../controllers/delivery.controller');
const validators = require('../validators/delivery.validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.use(authenticate);

router.post(
  '/register',
  authorize(ROLES.CUSTOMER, ROLES.DELIVERY),
  validators.registerPartner,
  validate,
  deliveryController.registerPartner,
);

// Restaurant (and admin) can list approved/online partners for order assignment.
router.get(
  '/partners/available',
  authorize(ROLES.RESTAURANT, ROLES.ADMIN),
  deliveryController.listAvailablePartners,
);

router.use(authorize(ROLES.DELIVERY, ROLES.ADMIN));

router.get('/me', deliveryController.getMyPartnerProfile);
router.patch('/availability', validators.updateAvailability, validate, deliveryController.updateAvailability);
router.patch('/location', validators.updateLocation, validate, deliveryController.updateLocation);

router.get('/orders/available', deliveryController.nearbyAvailableOrders);
router.patch('/orders/:orderId/accept', validators.orderAction, validate, deliveryController.acceptOrder);
router.patch('/orders/:orderId/reject', validators.orderAction, validate, deliveryController.rejectOrder);
router.patch('/orders/:orderId/status', validators.orderAction, validate, deliveryController.updateOrderStatus);
router.get('/orders/my', deliveryController.getMyDeliveries);

router.get('/wallet', deliveryController.getWallet);
router.post('/withdraw', validators.requestWithdraw, validate, deliveryController.requestWithdraw);
router.get('/withdraw/my', deliveryController.getMyWithdrawals);

router.get('/admin/partners', authorize(ROLES.ADMIN), deliveryController.listPartners);
router.patch('/admin/partners/:id/approve', authorize(ROLES.ADMIN), deliveryController.approvePartner);
router.get('/admin/withdrawals', authorize(ROLES.ADMIN), deliveryController.listWithdrawals);
router.patch(
  '/admin/withdrawals/:id',
  authorize(ROLES.ADMIN),
  validators.processWithdraw,
  validate,
  deliveryController.processWithdraw,
);

module.exports = router;
