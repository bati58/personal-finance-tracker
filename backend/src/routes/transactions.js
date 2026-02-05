const express = require('express');
const Transaction = require('../models/Transaction');
const { dollarsToCents } = require('../utils/money');
const { transactionCreateSchema, transactionUpdateSchema } = require('../validators/transaction');

const router = express.Router();

function parseDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

router.post('/', async (req, res, next) => {
  try {
    const parsed = transactionCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid transaction data',
        details: parsed.error.flatten()
      });
    }

    const { amount, type, category, date } = parsed.data;
    const tx = await Transaction.create({
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
    const filter = {};

    if (type) {
      if (!['credit', 'debit'].includes(type)) {
        return res.status(400).json({ error: 'Invalid type filter' });
      }
      filter.type = type;
    }

    if (category) {
      filter.category = String(category).trim();
    }

    if (q) {
      filter.category = new RegExp(String(q), 'i');
    }

    if (start_date || end_date) {
      filter.date = {};
      if (start_date) {
        const parsedStart = parseDate(start_date);
        if (!parsedStart) return res.status(400).json({ error: 'Invalid start_date' });
        filter.date.$gte = parsedStart;
      }
      if (end_date) {
        const parsedEnd = parseDate(end_date);
        if (!parsedEnd) return res.status(400).json({ error: 'Invalid end_date' });
        filter.date.$lte = parsedEnd;
      }
    }

    const limitNum = Math.min(parseInt(limit || '200', 10), 500);
    const offsetNum = Math.max(parseInt(offset || '0', 10), 0);

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
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    return res.json(tx);
  } catch (err) {
    return next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const parsed = transactionUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid transaction data',
        details: parsed.error.flatten()
      });
    }

    const update = { ...parsed.data };
    if (update.amount !== undefined) {
      update.amountCents = dollarsToCents(update.amount);
      delete update.amount;
    }
    if (update.category) {
      update.category = update.category.trim();
    }

    const tx = await Transaction.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true
    });

    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    return res.json(tx);
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const tx = await Transaction.findByIdAndDelete(req.params.id);
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
