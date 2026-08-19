const ApiError = require('../utils/ApiError');
const messages = require('../constants/messages');

const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized(messages.ERROR.TOKEN_MISSING));
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(ApiError.forbidden(messages.ERROR.FORBIDDEN));
  }

  return next();
};

module.exports = { authorize };
