function toUTCDateOnly(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function getMondayUTC(date) {
  const d = toUTCDateOnly(date);
  const day = d.getUTCDay();
  const diff = (day + 6) % 7; // days since Monday
  d.setUTCDate(d.getUTCDate() - diff);
  return d;
}

function formatDateUTC(date) {
  return date.toISOString().slice(0, 10);
}

module.exports = { toUTCDateOnly, getMondayUTC, formatDateUTC };
