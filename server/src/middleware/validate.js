const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

// Runs after express-validator chains and turns failures into a 400.
function validate(req, _res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const details = result.array().map((e) => ({ field: e.path, message: e.msg }));
    throw new ApiError(400, 'Validation failed', details);
  }
  next();
}

module.exports = validate;
