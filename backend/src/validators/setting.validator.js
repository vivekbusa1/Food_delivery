const { body, param } = require('express-validator');

const upsertSetting = [
  body('key').trim().notEmpty().withMessage('Key is required'),
  body('value').exists().withMessage('Value is required'),
  body('group')
    .optional()
    .isIn(['general', 'payment', 'delivery', 'notification', 'commission', 'seo', 'other']),
];

const getSetting = [param('key').trim().notEmpty().withMessage('Key is required')];

module.exports = { upsertSetting, getSetting };
