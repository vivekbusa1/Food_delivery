const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { sendCreated } = require('../helpers/response');
const messages = require('../constants/messages');
const uploadService = require('../services/upload.service');

const uploadSingle = catchAsync(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file uploaded');

  const file = uploadService.mapUploadedFile(req.file);
  return sendCreated(res, 'File uploaded successfully', { file });
});

const uploadMultiple = catchAsync(async (req, res) => {
  if (!req.files || !req.files.length) throw ApiError.badRequest('No files uploaded');

  const files = uploadService.mapUploadedFiles(req.files);
  return sendCreated(res, 'Files uploaded successfully', { files });
});

const deleteUpload = catchAsync(async (req, res) => {
  const { publicId } = req.body;
  if (!publicId) throw ApiError.badRequest('publicId is required');

  await uploadService.deleteFromCloudinary(publicId);
  return sendCreated(res, messages.SUCCESS.DELETED, null);
});

module.exports = { uploadSingle, uploadMultiple, deleteUpload };
