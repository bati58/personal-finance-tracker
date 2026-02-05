const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { registerSchema, loginSchema } = require('../validators/auth');
const { sendError, sendValidationError } = require('../utils/errors');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    secret,
    { expiresIn }
  );
}

router.post('/register', async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendValidationError(res, 'Invalid registration data', parsed.error.flatten());
    }

    const { name, email, password } = parsed.data;
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return sendError(res, 409, 'Email is already registered', 'CONFLICT');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash
    });

    const token = signToken(user.toJSON());
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendValidationError(res, 'Invalid login data', parsed.error.flatten());
    }

    const { email, password } = parsed.data;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return sendError(res, 401, 'Invalid email or password', 'UNAUTHORIZED');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return sendError(res, 401, 'Invalid email or password', 'UNAUTHORIZED');
    }

    const token = signToken(user.toJSON());
    return res.json({ user: user.toJSON(), token });
  } catch (err) {
    return next(err);
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;
