const { z } = require('zod');

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(64, 'Name must be at most 64 characters')
    .regex(/^[A-Za-z]+(?: [A-Za-z]+)*$/, 'Name must contain only letters and spaces'),
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

module.exports = { registerSchema, loginSchema };
