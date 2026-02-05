require('dotenv').config();

const app = require('./app');
const { connectDb } = require('./db');

const PORT = process.env.PORT || 8000;
if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET is not set. Auth will fail until it is configured.');
}

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
