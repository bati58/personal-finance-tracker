require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDb } = require('./db');
const transactionsRouter = require('./routes/transactions');
const reportRouter = require('./routes/report');

const app = express();
const PORT = process.env.PORT || 8000;

const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((v) => v.trim()).filter(Boolean)
  : ['http://localhost:5173'];

app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/transactions', transactionsRouter);
app.use('/report', reportRouter);

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Server error' });
});

connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
