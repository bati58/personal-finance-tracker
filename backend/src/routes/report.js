const express = require('express');
const Transaction = require('../models/Transaction');
const { getMondayUTC, formatDateUTC, toUTCDateOnly } = require('../utils/date');
const { centsToDollars } = require('../utils/money');

const router = express.Router();

router.get('/weekly', async (req, res, next) => {
  try {
    const today = new Date();
    const currentWeekStart = getMondayUTC(today);
    const startDate = new Date(currentWeekStart);
    startDate.setUTCDate(startDate.getUTCDate() - 7 * 7); // last 8 weeks incl. current

    const transactions = await Transaction.find({
      userId: req.user.id,
      date: { $gte: startDate }
    });

    const weeklyData = new Map();

    for (const tx of transactions) {
      const txDate = toUTCDateOnly(tx.date);
      const weekStart = getMondayUTC(txDate);
      const key = formatDateUTC(weekStart);

      if (!weeklyData.has(key)) {
        weeklyData.set(key, { creditCents: 0, debitCents: 0 });
      }

      const entry = weeklyData.get(key);
      if (tx.type === 'credit') entry.creditCents += tx.amountCents;
      if (tx.type === 'debit') entry.debitCents += tx.amountCents;
    }

    const report = [];
    const cursor = new Date(startDate);

    while (cursor <= currentWeekStart) {
      const key = formatDateUTC(cursor);
      const data = weeklyData.get(key) || { creditCents: 0, debitCents: 0 };
      const totalCredit = centsToDollars(data.creditCents);
      const totalDebit = centsToDollars(data.debitCents);

      report.push({
        week_start: key,
        total_credit: totalCredit,
        total_debit: totalDebit,
        net_flow: Number((totalCredit - totalDebit).toFixed(2))
      });

      cursor.setUTCDate(cursor.getUTCDate() + 7);
    }

    return res.json(report);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
