const cloudinary = require('../config/cloudinary');
const logger = require('../utils/logger');

const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return null;
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    logger.error(`Failed to delete Cloudinary asset ${publicId}: ${error.message}`);
    return null;
  }
};

const mapUploadedFile = (file) => ({
  url: file.path || file.secure_url || file.url,
  publicId: file.filename || file.public_id,
});

const mapUploadedFiles = (files = []) => files.map(mapUploadedFile);

module.exports = { deleteFromCloudinary, mapUploadedFile, mapUploadedFiles };
