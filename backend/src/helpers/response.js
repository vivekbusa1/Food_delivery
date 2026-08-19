const sendResponse = (res, statusCode, message, data = null, meta = null) => {
  const body = {
    success: statusCode >= 200 && statusCode < 400,
    message,
    data,
  };

  if (meta) {
    body.meta = meta;
  }

  return res.status(statusCode).json(body);
};

const sendSuccess = (res, message, data = null, meta = null, statusCode = 200) =>
  sendResponse(res, statusCode, message, data, meta);

const sendCreated = (res, message, data = null) => sendResponse(res, 201, message, data);

module.exports = { sendResponse, sendSuccess, sendCreated };
