const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { connectDb, disconnectDb } = require('../src/db');

let mongoServer;

async function setupTestDb() {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
  process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();

  await connectDb(process.env.MONGODB_URI);
}

async function clearDb() {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
}

async function teardownTestDb() {
  await disconnectDb();
  if (mongoServer) {
    await mongoServer.stop();
  }
}

module.exports = { setupTestDb, clearDb, teardownTestDb };
