const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');
const messages = require('../constants/messages');

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formatted = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));
    return next(ApiError.badRequest(messages.ERROR.VALIDATION_ERROR, formatted));
  }

  return next();
};

module.exports = validate;
