const express = require('express');
const addressController = require('../controllers/address.controller');
const validators = require('../validators/address.validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', addressController.listAddresses);
router.post('/', validators.createAddress, validate, addressController.createAddress);
router.get('/:id', addressController.getAddressById);
router.patch('/:id', validators.updateAddress, validate, addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);
router.patch('/:id/default', addressController.setDefaultAddress);

module.exports = router;
