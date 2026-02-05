const request = require('supertest');
const { setupTestDb, clearDb, teardownTestDb } = require('./setupTestDb');
const { registerUser, loginUser } = require('./helpers');

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

test('registers a new user', async () => {
  const response = await registerUser(app);
  expect(response.status).toBe(201);
  expect(response.body.user).toBeDefined();
  expect(response.body.user.email).toBe('test@example.com');
  expect(response.body.token).toBeDefined();
});

test('logs in an existing user', async () => {
  await registerUser(app);
  const response = await loginUser(app);
  expect(response.status).toBe(200);
  expect(response.body.token).toBeDefined();
});

test('returns current user from /auth/me with token', async () => {
  await registerUser(app);
  const loginResponse = await loginUser(app);
  const token = loginResponse.body.token;

  const response = await request(app)
    .get('/auth/me')
    .set('Authorization', `Bearer ${token}`);

  expect(response.status).toBe(200);
  expect(response.body.user).toBeDefined();
  expect(response.body.user.email).toBe('test@example.com');
});
