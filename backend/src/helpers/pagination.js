const getPagination = (query, defaultLimit = 10, maxLimit = 100) => {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (!Number.isInteger(page) || page < 1) page = 1;
  if (!Number.isInteger(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const buildMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.max(Math.ceil(total / limit), 1),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});

const paginate = async (model, filter = {}, options = {}) => {
  const { page, limit, skip } = getPagination(options);
  const sort = options.sort || { createdAt: -1 };
  const populate = options.populate || null;
  const select = options.select || null;

  let queryBuilder = model.find(filter).sort(sort).skip(skip).limit(limit);
  if (populate) queryBuilder = queryBuilder.populate(populate);
  if (select) queryBuilder = queryBuilder.select(select);

  const [data, total] = await Promise.all([
    queryBuilder.exec(),
    model.countDocuments(filter),
  ]);

  return { data, meta: buildMeta(total, page, limit) };
};

module.exports = { getPagination, buildMeta, paginate };
