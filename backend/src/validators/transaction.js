const { z } = require('zod');

const transactionCreateSchema = z.object({
  type: z.enum(['credit', 'debit']),
  amount: z.coerce.number().positive(),
  category: z.string().min(1).max(64),
  date: z.coerce.date()
});

const transactionUpdateSchema = transactionCreateSchema.partial();

module.exports = { transactionCreateSchema, transactionUpdateSchema };
