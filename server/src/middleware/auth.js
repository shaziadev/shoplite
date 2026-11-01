const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

// Reads "Authorization: Bearer <token>", verifies it and attaches req.user.
async function protect(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new ApiError(401, 'Not authenticated');
  }

  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch {
    throw new ApiError(401, 'Invalid or expired token');
  }

  const user = await User.findById(payload.id);
  if (!user) throw new ApiError(401, 'User no longer exists');

  req.user = user;
  next();
}

// Role guard, used after protect: router.post('/', protect, requireRole('admin'), ...)
function requireRole(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'You do not have permission to do this');
    }
    next();
  };
}

module.exports = { protect, requireRole };
