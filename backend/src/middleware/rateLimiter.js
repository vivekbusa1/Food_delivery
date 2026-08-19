const rateLimit = require('express-rate-limit');
const config = require('../config');

const isDev = config.env === 'development' || config.env === 'dev' || config.env === 'test';

const buildLimiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    max: isDev ? Math.max(max * 50, 1000) : max,
    standardHeaders: true,
    legacyHeaders: false,
    // Local development: never lock out the browser after repeated login/debug attempts.
    skip: () => isDev,
    message: {
      success: false,
      message: message || 'Too many requests, please try again later',
      data: null,
    },
  });

const apiLimiter = buildLimiter({
  windowMs: config.rateLimit.windowMinutes * 60 * 1000,
  max: config.rateLimit.max,
});

const authLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 200 : 20,
  message: 'Too many authentication attempts, please try again later',
});

const otpLimiter = buildLimiter({
  windowMs: 10 * 60 * 1000,
  max: isDev ? 50 : 5,
  message: 'Too many OTP requests, please try again later',
});

module.exports = { apiLimiter, authLimiter, otpLimiter, buildLimiter };
