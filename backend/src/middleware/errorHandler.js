/* Centralized error + 404 handlers. All responses are clean JSON. */

function notFound(req, res, next) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const payload = { error: err.message || 'Internal Server Error' };

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    payload.error = err.errors?.map((e) => e.message).join('; ') || payload.error;
    return res.status(400).json(payload);
  }

  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err.stack;
  }
  res.status(status).json(payload);
}

module.exports = { notFound, errorHandler };
