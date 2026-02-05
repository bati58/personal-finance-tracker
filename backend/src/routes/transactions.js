const express = require('express');
const Transaction = require('../models/Transaction');
const { dollarsToCents } = require('../utils/money');
const { transactionCreateSchema, transactionUpdateSchema } = require('../validators/transaction');
const { sendError, sendValidationError } = require('../utils/errors');

const router = express.Router();

function parseDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

router.post('/', async (req, res, next) => {
  try {
    const parsed = transactionCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendValidationError(res, 'Invalid transaction data', parsed.error.flatten());
    }

    const { amount, type, category, date } = parsed.data;
    const tx = await Transaction.create({
      userId: req.user.id,
      type,
      category: category.trim(),
      amountCents: dollarsToCents(amount),
      date
    });

    return res.status(201).json(tx);
  } catch (err) {
    return next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { type, start_date, end_date, category, q, limit, offset } = req.query;
    const andFilters = [];

    andFilters.push({ userId: req.user.id });

    if (type) {
      if (!['credit', 'debit'].includes(type)) {
        return sendValidationError(res, 'Invalid type filter');
      }
      andFilters.push({ type });
    }

    if (category) {
      andFilters.push({ category: String(category).trim() });
    }

    if (q) {
      const pattern = escapeRegex(String(q).trim());
      if (pattern) {
        andFilters.push({ category: new RegExp(pattern, 'i') });
      }
    }

    if (start_date || end_date) {
      const dateFilter = {};
      if (start_date) {
        const parsedStart = parseDate(start_date);
        if (!parsedStart) return sendValidationError(res, 'Invalid start_date');
        dateFilter.$gte = parsedStart;
      }
      if (end_date) {
        const parsedEnd = parseDate(end_date);
        if (!parsedEnd) return sendValidationError(res, 'Invalid end_date');
        dateFilter.$lte = parsedEnd;
      }
      if (Object.keys(dateFilter).length > 0) {
        andFilters.push({ date: dateFilter });
      }
    }

    const parsedLimit = parseInt(limit, 10);
    const parsedOffset = parseInt(offset, 10);
    const limitNum = Number.isFinite(parsedLimit) ? Math.min(parsedLimit, 500) : 200;
    const offsetNum = Number.isFinite(parsedOffset) ? Math.max(parsedOffset, 0) : 0;

    const filter = andFilters.length > 0 ? { $and: andFilters } : {};

    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .skip(offsetNum)
      .limit(limitNum);

    return res.json(transactions);
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const tx = await Transaction.findOne({ _id: req.params.id, userId: req.user.id });
    if (!tx) return sendError(res, 404, 'Transaction not found', 'NOT_FOUND');
    return res.json(tx);
  } catch (err) {
    return next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const parsed = transactionUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendValidationError(res, 'Invalid transaction data', parsed.error.flatten());
    }

    const update = { ...parsed.data };
    if (Object.keys(update).length === 0) {
      return sendValidationError(res, 'No fields provided for update');
    }
    if (update.amount !== undefined) {
      update.amountCents = dollarsToCents(update.amount);
      delete update.amount;
    }
    if (update.category) {
      update.category = update.category.trim();
    }

    const tx = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      update,
      {
      new: true,
      runValidators: true
      }
    );

    if (!tx) return sendError(res, 404, 'Transaction not found', 'NOT_FOUND');
    return res.json(tx);
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const tx = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!tx) return sendError(res, 404, 'Transaction not found', 'NOT_FOUND');
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
