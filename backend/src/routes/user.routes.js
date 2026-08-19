const express = require('express');
const userController = require('../controllers/user.controller');
const validators = require('../validators/user.validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const upload = require('../middleware/upload');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.use(authenticate);

router.get('/me', userController.getProfile);
router.patch('/me', validators.updateProfile, validate, userController.updateProfile);
router.patch('/me/avatar', upload.single('avatar'), userController.updateAvatar);
router.delete('/me', userController.deleteAccount);
router.post('/me/fcm-token', userController.registerFcmToken);

router.get('/', authorize(ROLES.ADMIN), userController.listUsers);
router.get('/:id', authorize(ROLES.ADMIN), validators.mongoIdParam('id'), validate, userController.getUserById);
router.patch(
  '/:id/status',
  authorize(ROLES.ADMIN),
  validators.updateUserStatus,
  validate,
  userController.updateUserStatus,
);
router.delete('/:id', authorize(ROLES.ADMIN), validators.mongoIdParam('id'), validate, userController.deleteUser);

module.exports = router;
