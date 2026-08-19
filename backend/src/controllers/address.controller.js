const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { sendSuccess, sendCreated } = require('../helpers/response');
const messages = require('../constants/messages');
const Address = require('../models/Address');

const createAddress = catchAsync(async (req, res) => {
  const addressCount = await Address.countDocuments({ user: req.user._id });

  const address = await Address.create({
    ...req.body,
    user: req.user._id,
    isDefault: addressCount === 0 ? true : !!req.body.isDefault,
  });

  if (address.isDefault) {
    await Address.updateMany(
      { user: req.user._id, _id: { $ne: address._id } },
      { isDefault: false },
    );
  }

  return sendCreated(res, messages.SUCCESS.CREATED, { address });
});

const listAddresses = catchAsync(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
  return sendSuccess(res, messages.SUCCESS.FETCHED, { addresses });
});

const getAddressById = catchAsync(async (req, res) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
  if (!address) throw ApiError.notFound(messages.ERROR.NOT_FOUND);
  return sendSuccess(res, messages.SUCCESS.FETCHED, { address });
});

const updateAddress = catchAsync(async (req, res) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
  if (!address) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  Object.assign(address, req.body);
  await address.save();

  if (address.isDefault) {
    await Address.updateMany(
      { user: req.user._id, _id: { $ne: address._id } },
      { isDefault: false },
    );
  }

  return sendSuccess(res, messages.SUCCESS.UPDATED, { address });
});

const deleteAddress = catchAsync(async (req, res) => {
  const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!address) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  if (address.isDefault) {
    const nextAddress = await Address.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    if (nextAddress) {
      nextAddress.isDefault = true;
      await nextAddress.save();
    }
  }


  return sendSuccess(res, messages.SUCCESS.DELETED);
});

const setDefaultAddress = catchAsync(async (req, res) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
  if (!address) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  address.isDefault = true;
  await address.save();

  await Address.updateMany({ user: req.user._id, _id: { $ne: address._id } }, { isDefault: false });

  return sendSuccess(res, messages.SUCCESS.UPDATED, { address });
});

module.exports = {
  createAddress,
  listAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
