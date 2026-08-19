const ROLES = Object.freeze({
  CUSTOMER: 'customer',
  RESTAURANT: 'restaurant',
  ADMIN: 'admin',
  DELIVERY: 'delivery',
});

const ALL_ROLES = Object.values(ROLES);

module.exports = { ROLES, ALL_ROLES };
