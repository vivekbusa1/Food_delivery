const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { sendSuccess, sendCreated } = require('../helpers/response');
const messages = require('../constants/messages');
const Setting = require('../models/Setting');

const listPublicSettings = catchAsync(async (req, res) => {
  const settings = await Setting.find({ isPublic: true });
  const map = settings.reduce((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {});

  return sendSuccess(res, messages.SUCCESS.FETCHED, { settings: map });
});

const listAllSettings = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.group) filter.group = req.query.group;

  const settings = await Setting.find(filter).sort({ group: 1, key: 1 });
  return sendSuccess(res, messages.SUCCESS.FETCHED, { settings });
});

const getSetting = catchAsync(async (req, res) => {
  const setting = await Setting.findOne({ key: req.params.key });
  if (!setting) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  return sendSuccess(res, messages.SUCCESS.FETCHED, { setting });
});

const upsertSetting = catchAsync(async (req, res) => {
  const { key, value, group, description, isPublic } = req.body;

  const setting = await Setting.findOneAndUpdate(
    { key },
    { value, group, description, isPublic },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );

  return sendCreated(res, messages.SUCCESS.UPDATED, { setting });
});

const deleteSetting = catchAsync(async (req, res) => {
  const setting = await Setting.findOneAndDelete({ key: req.params.key });
  if (!setting) throw ApiError.notFound(messages.ERROR.NOT_FOUND);

  return sendSuccess(res, messages.SUCCESS.DELETED);
});

module.exports = {
  listPublicSettings,
  listAllSettings,
  getSetting,
  upsertSetting,
  deleteSetting,
};
