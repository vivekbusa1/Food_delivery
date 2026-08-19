const mongoose = require('mongoose');
const config = require('../config');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const messages = require('../constants/messages');

const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

const convertToApiError = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || 500;
    let message = error.message || messages.ERROR.SERVER_ERROR;
    let errors = [];

    if (error instanceof mongoose.Error.ValidationError) {
      statusCode = 400;
      message = messages.ERROR.VALIDATION_ERROR;
      errors = Object.values(error.errors).map((e) => ({ field: e.path, message: e.message }));
    } else if (error instanceof mongoose.Error.CastError) {
      statusCode = 400;
      message = `Invalid value for field: ${error.path}`;
    } else if (error.code === 11000) {
      statusCode = 409;
      const field = Object.keys(error.keyValue || {})[0];
      message = field ? `${field} already exists` : 'Duplicate field value';
    } else if (error.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = messages.ERROR.INVALID_TOKEN;
    } else if (error.name === 'TokenExpiredError') {
      statusCode = 401;
      message = messages.ERROR.INVALID_TOKEN;
    } else if (error.name === 'MulterError') {
      statusCode = 400;
      message = error.message;
    }

    error = new ApiError(statusCode, message, errors, false, error.stack);
  }

  next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const { statusCode = 500, message, errors = [] } = err;

  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} - ${message}`, { stack: err.stack });
  } else {
    logger.warn(`${req.method} ${req.originalUrl} - ${message}`);
  }

  const response = {
    success: false,
    message: message || messages.ERROR.SERVER_ERROR,
    data: null,
  };

  if (errors && errors.length > 0) {
    response.errors = errors;
  }

  if (config.env === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = { notFoundHandler, convertToApiError, errorHandler };
