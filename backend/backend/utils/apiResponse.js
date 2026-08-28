const success = (res, statusCode, message, data = null, extra = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...extra,
  });
};

const error = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = { success, error };
