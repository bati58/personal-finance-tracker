const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/errors');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return sendError(res, 401, 'Missing or invalid authorization token', 'UNAUTHORIZED');
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name
    };
    return next();
  } catch (err) {
    return sendError(res, 401, 'Invalid or expired token', 'UNAUTHORIZED');
  }
}

module.exports = { authMiddleware };
