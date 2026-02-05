const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const transactionsRouter = require('./routes/transactions');
const reportRouter = require('./routes/report');
const authRouter = require('./routes/auth');
const { authMiddleware } = require('./middleware/auth');
const { errorResponse } = require('./utils/errors');

const app = express();

const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((v) => v.trim()).filter(Boolean)
  : ['http://localhost:5173'];

app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json({ limit: '1mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRouter);
app.use('/transactions', authMiddleware, transactionsRouter);
app.use('/report', authMiddleware, reportRouter);

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.statusCode || 500;
  const code = err.code || (status >= 500 ? 'SERVER_ERROR' : 'ERROR');
  res.status(status).json(errorResponse(err.message || 'Server error', code, err.details));
});

module.exports = app;
