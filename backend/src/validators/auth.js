const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(1).max(64),
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

module.exports = { registerSchema, loginSchema };
