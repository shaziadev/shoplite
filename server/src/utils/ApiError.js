// Small error class so controllers can `throw new ApiError(404, 'Not found')`
// and the error middleware turns it into a clean JSON response.
class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

module.exports = ApiError;
