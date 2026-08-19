const { verifyAccessToken } = require('../config/jwt');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const messages = require('../constants/messages');
const User = require('../models/User');

const extractToken = (req) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  if (req.cookies && req.cookies.accessToken) {
    return req.cookies.accessToken;
  }
  return null;
};

const authenticate = catchAsync(async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    throw ApiError.unauthorized(messages.ERROR.TOKEN_MISSING);
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    throw ApiError.unauthorized(messages.ERROR.INVALID_TOKEN);
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    throw ApiError.unauthorized(messages.ERROR.INVALID_TOKEN);
  }

  if (!user.isActive || user.isBlocked) {
    throw ApiError.forbidden(messages.ERROR.ACCOUNT_INACTIVE);
  }

  req.user = user;
  req.tokenPayload = decoded;
  next();
});

const optionalAuth = catchAsync(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return next();

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);
    if (user && user.isActive && !user.isBlocked) {
      req.user = user;
    }
  } catch (err) {
    // ignore invalid token for optional auth
  }
  return next();
});

module.exports = { authenticate, optionalAuth };
