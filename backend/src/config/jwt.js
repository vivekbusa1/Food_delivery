const jwt = require('jsonwebtoken');
const config = require('./index');

const signAccessToken = (payload) =>
  jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expire });

const signRefreshToken = (payload) =>
  jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpire });

const verifyAccessToken = (token) => jwt.verify(token, config.jwt.secret);

const verifyRefreshToken = (token) => jwt.verify(token, config.jwt.refreshSecret);

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
