const request = require('supertest');
const { setupTestDb, clearDb, teardownTestDb } = require('./setupTestDb');
const { getAuthToken } = require('./helpers');

let app;

beforeAll(async () => {
  await setupTestDb();
  app = require('../src/app');
});

afterEach(async () => {
  await clearDb();
});

afterAll(async () => {
  await teardownTestDb();
});

test('requires auth for transactions', async () => {
  const response = await request(app).get('/transactions');
  expect(response.status).toBe(401);
});

test('creates, reads, updates, and deletes a transaction', async () => {
  const token = await getAuthToken(app);
  const headers = { Authorization: `Bearer ${token}` };

  const createResponse = await request(app)
    .post('/transactions')
    .set(headers)
    .send({
      type: 'debit',
      amount: 25.5,
      category: 'Groceries',
      date: new Date().toISOString()
    });

  expect(createResponse.status).toBe(201);
  expect(createResponse.body.id).toBeDefined();

  const listResponse = await request(app).get('/transactions').set(headers);
  expect(listResponse.status).toBe(200);
  expect(listResponse.body.length).toBe(1);

  const txId = createResponse.body.id;
  const updateResponse = await request(app)
    .put(`/transactions/${txId}`)
    .set(headers)
    .send({ amount: 40, category: 'Food' });

  expect(updateResponse.status).toBe(200);
  expect(updateResponse.body.amount).toBe(40);
  expect(updateResponse.body.category).toBe('Food');

  const deleteResponse = await request(app)
    .delete(`/transactions/${txId}`)
    .set(headers);
  expect(deleteResponse.status).toBe(204);
});
