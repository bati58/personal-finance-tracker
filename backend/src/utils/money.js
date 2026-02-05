function dollarsToCents(amount) {
  const number = Number(amount);
  if (!Number.isFinite(number)) {
    throw new Error('Invalid amount');
  }
  return Math.round(number * 100);
}

function centsToDollars(cents) {
  return Number((cents / 100).toFixed(2));
}

module.exports = { dollarsToCents, centsToDollars };
