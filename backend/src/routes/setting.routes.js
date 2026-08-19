const express = require('express');
const settingController = require('../controllers/setting.controller');
const validators = require('../validators/setting.validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.get('/public', settingController.listPublicSettings);

router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/', settingController.listAllSettings);
router.get('/:key', validators.getSetting, validate, settingController.getSetting);
router.put('/', validators.upsertSetting, validate, settingController.upsertSetting);
router.delete('/:key', settingController.deleteSetting);

module.exports = router;
