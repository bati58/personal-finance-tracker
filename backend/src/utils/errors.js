function errorResponse(message, code = 'ERROR', details) {
  const error = { message, code };
  if (details) {
    error.details = details;
  }
  return { error };
}

function sendError(res, status, message, code = 'ERROR', details) {
  return res.status(status).json(errorResponse(message, code, details));
}

function sendValidationError(res, message, details) {
  return sendError(res, 400, message, 'VALIDATION_ERROR', details);
}

module.exports = { errorResponse, sendError, sendValidationError };
