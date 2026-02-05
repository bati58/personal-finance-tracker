const mongoose = require('mongoose');
const { centsToDollars } = require('../utils/money');

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true
    },
    amountCents: {
      type: Number,
      required: true,
      min: 1
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

transactionSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    ret.amount = centsToDollars(ret.amountCents);
    delete ret._id;
    delete ret.__v;
    delete ret.amountCents;
    return ret;
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
