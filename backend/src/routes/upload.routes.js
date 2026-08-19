const express = require('express');
const uploadController = require('../controllers/upload.controller');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(authenticate);

router.post('/single', upload.single('file'), uploadController.uploadSingle);
router.post('/multiple', upload.array('files', 10), uploadController.uploadMultiple);
router.delete('/', uploadController.deleteUpload);

module.exports = router;
