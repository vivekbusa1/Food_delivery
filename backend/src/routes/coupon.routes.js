const express = require('express');
const couponController = require('../controllers/coupon.controller');
const validators = require('../validators/coupon.validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.get('/active', couponController.listActiveCoupons);

router.post(
  '/validate',
  authenticate,
  validators.validateCoupon,
  validate,
  couponController.validateCoupon,
);

router.use(authenticate, authorize(ROLES.ADMIN, ROLES.RESTAURANT));

router.get('/', couponController.listCoupons);
router.post('/', validators.createCoupon, validate, couponController.createCoupon);
router.get('/:id', couponController.getCouponById);
router.patch('/:id', validators.updateCoupon, validate, couponController.updateCoupon);
router.delete('/:id', couponController.deleteCoupon);

module.exports = router;
