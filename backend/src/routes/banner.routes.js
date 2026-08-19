const express = require('express');
const bannerController = require('../controllers/banner.controller');
const validators = require('../validators/banner.validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const upload = require('../middleware/upload');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.get('/', bannerController.listBanners);
router.get('/admin/all', authenticate, authorize(ROLES.ADMIN), bannerController.listAllBanners);

router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  upload.single('image'),
  validators.createBanner,
  validate,
  bannerController.createBanner,
);
router.patch(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  upload.single('image'),
  validators.updateBanner,
  validate,
  bannerController.updateBanner,
);
router.delete('/:id', authenticate, authorize(ROLES.ADMIN), bannerController.deleteBanner);

module.exports = router;
