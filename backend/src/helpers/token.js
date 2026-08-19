const crypto = require('crypto');

const generateOTP = (length = 4) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i += 1) {
    otp += digits[crypto.randomInt(0, digits.length)];
  }
  return otp;
};

const generateRandomToken = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

const generateCouponUsageKey = (couponId, userId) => `${couponId}_${userId}`;

module.exports = {
  generateOTP,
  generateRandomToken,
  hashToken,
  generateOrderNumber,
  generateCouponUsageKey,
};
