const express = require('express');
const categoryController = require('../controllers/category.controller');
const validators = require('../validators/category.validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const upload = require('../middleware/upload');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.get('/cuisines', categoryController.listCuisines);

router.get('/food', categoryController.listFoodCategories);
router.post(
  '/food',
  authenticate,
  authorize(ROLES.RESTAURANT, ROLES.ADMIN),
  upload.single('image'),
  validators.createFoodCategory,
  validate,
  categoryController.createFoodCategory,
);
router.get('/food/:id', categoryController.getFoodCategoryById);
router.patch(
  '/food/:id',
  authenticate,
  authorize(ROLES.RESTAURANT, ROLES.ADMIN),
  upload.single('image'),
  validators.updateCategory,
  validate,
  categoryController.updateFoodCategory,
);
router.delete(
  '/food/:id',
  authenticate,
  authorize(ROLES.RESTAURANT, ROLES.ADMIN),
  categoryController.deleteFoodCategory,
);

router.get('/restaurant', categoryController.listRestaurantCategories);
router.post(
  '/restaurant',
  authenticate,
  authorize(ROLES.ADMIN),
  upload.single('image'),
  validators.createRestaurantCategory,
  validate,
  categoryController.createRestaurantCategory,
);
router.patch(
  '/restaurant/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  upload.single('image'),
  validators.updateCategory,
  validate,
  categoryController.updateRestaurantCategory,
);
router.delete(
  '/restaurant/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  categoryController.deleteRestaurantCategory,
);

module.exports = router;
