const config = require('../config/env');

function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Express 5 forwards errors from async handlers here automatically.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  let status = err.statusCode || 500;
  let message = err.message || 'Something went wrong';

  // Translate common Mongoose errors into friendly 4xx responses.
  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err.code === 11000) {
    status = 409;
    message = `${Object.keys(err.keyValue).join(', ')} already exists`;
  } else if (err.name === 'ValidationError') {
    status = 400;
  }

  if (status >= 500 && config.nodeEnv !== 'test') console.error(err);

  res.status(status).json({
    message,
    ...(err.details && { details: err.details }),
    ...(config.nodeEnv === 'development' && status >= 500 && { stack: err.stack }),
  });
}

module.exports = { notFound, errorHandler };
