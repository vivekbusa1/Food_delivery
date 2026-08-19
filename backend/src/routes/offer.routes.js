const express = require('express');
const bannerController = require('../controllers/banner.controller');
const validators = require('../validators/banner.validator');
const validate = require('../middleware/validate');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const upload = require('../middleware/upload');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.get('/', optionalAuth, bannerController.listOffers);
router.get('/admin/all', authenticate, authorize(ROLES.ADMIN), bannerController.listAllOffers);
router.get(
  '/mine',
  authenticate,
  authorize(ROLES.RESTAURANT, ROLES.ADMIN),
  bannerController.listMyOffers,
);

router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.RESTAURANT),
  upload.single('image'),
  validators.createOffer,
  validate,
  bannerController.createOffer,
);
router.patch(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.RESTAURANT),
  upload.single('image'),
  validators.updateOffer,
  validate,
  bannerController.updateOffer,
);
router.delete('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.RESTAURANT), bannerController.deleteOffer);

module.exports = router;
